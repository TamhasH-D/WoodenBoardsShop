import json
import logging
import asyncio
from datetime import datetime, timezone
from typing import Dict, Set, Optional, List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.websockets import WebSocketState

from backend.dtos.chat_message_dtos import WebSocketMessageDTO

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws")


class ConnectionInfo:
    """Информация о WebSocket соединении."""

    def __init__(self, websocket: WebSocket, user_id: str, user_type: Optional[str] = None):
        self.websocket = websocket
        self.user_id = user_id
        self.user_type = user_type  # 'buyer', 'seller', or None for global seller
        self.connected_at = datetime.now(timezone.utc)
        self.last_ping = datetime.now(timezone.utc)
        self.is_alive = True


class ConnectionManager:
    """Улучшенный менеджер WebSocket соединений."""

    def __init__(self):
        # Для чатов: {thread_id: {user_id: ConnectionInfo}}
        self.active_chat_connections: Dict[str, Dict[str, ConnectionInfo]] = {}
        # Для глобальных уведомлений продавцов: {seller_id: ConnectionInfo}
        self.active_seller_connections: Dict[str, ConnectionInfo] = {}
        self.ping_interval = 30  # Интервал ping в секундах
        self._ping_tasks: Dict[str, asyncio.Task] = {} # Ключ: "chat:{thread_id}:{user_id}" или "seller:{seller_id}"

    async def connect_chat(self, websocket: WebSocket, thread_id: str, user_id: str, user_type: str):
        """Подключить пользователя к чат-треду."""
        await self._connect_internal(websocket, user_id, user_type, thread_id=thread_id)
        # Уведомляем других участников о подключении
        await self._notify_user_joined_chat(thread_id, user_id, user_type)

    async def connect_seller_global(self, websocket: WebSocket, seller_id: str):
        """Подключить продавца к глобальному каналу уведомлений."""
        await self._connect_internal(websocket, seller_id, user_type="seller", seller_id_global=seller_id)

    async def _connect_internal(
        self,
        websocket: WebSocket,
        user_id: str, # В контексте чата это buyer_id или seller_id, в контексте глобал это seller_id
        user_type: Optional[str] = None, # 'buyer', 'seller'
        thread_id: Optional[str] = None, # Для чат соединений
        seller_id_global: Optional[str] = None # Для глобальных соединений продавца
    ):
        """Внутренний метод для установки соединения."""
        try:
            await websocket.accept()
            connection_key_prefix = "chat" if thread_id else "seller"
            log_identifier = f"thread {thread_id}" if thread_id else f"global seller channel {seller_id_global}"
            logger.info(f"WebSocket connection accepted for user {user_id} in {log_identifier}")

            connection_info = ConnectionInfo(websocket, user_id, user_type)

            # Закрываем предыдущее соединение если есть
            await self._close_existing_connection(user_id, thread_id, seller_id_global)

            if thread_id:
                if thread_id not in self.active_chat_connections:
                    self.active_chat_connections[thread_id] = {}
                self.active_chat_connections[thread_id][user_id] = connection_info
                ping_key = f"chat:{thread_id}:{user_id}"
            elif seller_id_global:
                self.active_seller_connections[seller_id_global] = connection_info
                ping_key = f"seller:{seller_id_global}"
            else:
                # Этого не должно произойти, если логика верна
                logger.error("Connection attempt without thread_id or seller_id_global")
                await websocket.close(code=1008) # Policy Violation
                return

            # Запускаем ping для этого соединения
            await self._start_ping_for_connection(ping_key, connection_info)
            logger.info(f"User {user_id} ({user_type or 'global_seller'}) connected to {log_identifier}")

        except Exception as e:
            logger.error(f"Error connecting user {user_id} to {log_identifier if (thread_id or seller_id_global) else 'unknown'}: {e}")
            # Попытка закрыть вебсокет, если он еще открыт и не был принят
            if websocket.client_state != WebSocketState.DISCONNECTED:
                try:
                    await websocket.close(code=1011) # Internal Error
                except Exception as close_exc:
                    logger.error(f"Error trying to close websocket for user {user_id} after connection failure: {close_exc}")
            raise

    async def _close_existing_connection(self, user_id: str, thread_id: Optional[str], seller_id_global: Optional[str]):
        """Закрывает существующее активное соединение и останавливает связанный с ним ping task."""
        old_connection: Optional[ConnectionInfo] = None
        ping_key_to_stop: Optional[str] = None

        if thread_id and user_id in self.active_chat_connections.get(thread_id, {}):
            old_connection = self.active_chat_connections[thread_id][user_id]
            ping_key_to_stop = f"chat:{thread_id}:{user_id}"
            logger.info(f"Found existing chat connection for user {user_id} in thread {thread_id}. Closing it.")
        elif seller_id_global and seller_id_global in self.active_seller_connections:
            old_connection = self.active_seller_connections[seller_id_global]
            ping_key_to_stop = f"seller:{seller_id_global}"
            logger.info(f"Found existing global connection for seller {seller_id_global}. Closing it.")

        if old_connection:
            try:
                await old_connection.websocket.close()
            except Exception as e:
                logger.warning(f"Error closing old websocket for {user_id}: {e}")
            old_connection.is_alive = False # На всякий случай

        if ping_key_to_stop and ping_key_to_stop in self._ping_tasks:
            self._ping_tasks[ping_key_to_stop].cancel()
            del self._ping_tasks[ping_key_to_stop]
            logger.debug(f"Stopped old ping task for key: {ping_key_to_stop}")


    def disconnect_chat(self, thread_id: str, user_id: str):
        """Отключить пользователя от чат-треда."""
        self._disconnect_internal(user_id, thread_id=thread_id)
        asyncio.create_task(self._notify_user_left_chat(thread_id, user_id))


    def disconnect_seller_global(self, seller_id: str):
        """Отключить продавца от глобального канала."""
        self._disconnect_internal(seller_id, seller_id_global=seller_id)

    def _disconnect_internal(self, user_id: str, thread_id: Optional[str] = None, seller_id_global: Optional[str] = None):
        """Внутренний метод для завершения соединения."""
        connection_info: Optional[ConnectionInfo] = None
        ping_task_key: Optional[str] = None
        log_identifier: str = ""

        if thread_id and thread_id in self.active_chat_connections and user_id in self.active_chat_connections[thread_id]:
            connection_info = self.active_chat_connections[thread_id][user_id]
            ping_task_key = f"chat:{thread_id}:{user_id}"
            log_identifier = f"user {user_id} from thread {thread_id}"
            del self.active_chat_connections[thread_id][user_id]
            if not self.active_chat_connections[thread_id]:
                del self.active_chat_connections[thread_id]
                logger.info(f"Thread {thread_id} removed (no active chat connections)")

        elif seller_id_global and seller_id_global in self.active_seller_connections:
            connection_info = self.active_seller_connections[seller_id_global]
            ping_task_key = f"seller:{seller_id_global}"
            log_identifier = f"seller {seller_id_global} from global channel"
            del self.active_seller_connections[seller_id_global]
            logger.info(f"Seller {seller_id_global} disconnected from global channel.")

        if connection_info:
            connection_info.is_alive = False
            if ping_task_key and ping_task_key in self._ping_tasks:
                self._ping_tasks[ping_task_key].cancel()
                del self._ping_tasks[ping_task_key]
            logger.info(f"Disconnected {log_identifier}")
        else:
            logger.warning(f"Attempted to disconnect non-existent connection: user={user_id}, thread={thread_id}, seller_global={seller_id_global}")


    async def send_personal_message_to_chat_user(self, message: str, thread_id: str, user_id: str):
        """Отправить сообщение конкретному пользователю в чате."""
        if thread_id in self.active_chat_connections and user_id in self.active_chat_connections[thread_id]:
            connection_info = self.active_chat_connections[thread_id][user_id]
            await self._send_to_connection(message, connection_info, f"chat:{thread_id}:{user_id}")

    async def send_notification_to_seller(self, message: str, seller_id: str):
        """Отправить уведомление конкретному продавцу на его глобальный канал."""
        if seller_id in self.active_seller_connections:
            connection_info = self.active_seller_connections[seller_id]
            await self._send_to_connection(message, connection_info, f"seller:{seller_id}")
        else:
            logger.debug(f"Seller {seller_id} not connected to global channel. Notification not sent.")


    async def _send_to_connection(self, message: str, connection_info: ConnectionInfo, log_key_for_disconnect: str):
        """Отправляет сообщение через указанное WebSocket соединение."""
        if connection_info.websocket.client_state == WebSocketState.CONNECTED and connection_info.is_alive:
            try:
                await connection_info.websocket.send_text(message)
                logger.debug(f"Message sent to {connection_info.user_id} via {log_key_for_disconnect}")
            except Exception as e:
                logger.error(f"Error sending message to {connection_info.user_id} (key: {log_key_for_disconnect}): {e}")
                # Разбираем ключ для корректного вызова disconnect
                key_parts = log_key_for_disconnect.split(':')
                if key_parts[0] == "chat" and len(key_parts) == 3:
                    self.disconnect_chat(key_parts[1], key_parts[2])
                elif key_parts[0] == "seller" and len(key_parts) == 2:
                    self.disconnect_seller_global(key_parts[1])
        else:
            logger.warning(f"Attempted to send to non-connected/non-alive websocket for {connection_info.user_id} (key: {log_key_for_disconnect})")


    async def broadcast_to_chat_thread(self, message: str, thread_id: str, exclude_user_id: Optional[str] = None):
        """Отправить сообщение всем участникам чат-треда."""
        logger.debug(f"Broadcasting to chat thread {thread_id}, exclude_user_id={exclude_user_id}")
        if thread_id in self.active_chat_connections:
            disconnected_users_in_thread = []
            sent_count = 0
            connections_in_thread = list(self.active_chat_connections[thread_id].items()) # Копируем для безопасной итерации

            for user_id, connection_info in connections_in_thread:
                if exclude_user_id and user_id == exclude_user_id:
                    logger.debug(f"Skipping excluded user: {user_id} in thread {thread_id}")
                    continue

                if connection_info.websocket.client_state == WebSocketState.CONNECTED and connection_info.is_alive:
                    try:
                        await connection_info.websocket.send_text(message)
                        sent_count += 1
                    except Exception as e:
                        logger.error(f"Error broadcasting to {user_id} in thread {thread_id}: {e}")
                        disconnected_users_in_thread.append(user_id)
                else:
                    disconnected_users_in_thread.append(user_id)

            logger.debug(f"Chat broadcast to thread {thread_id} complete: sent to {sent_count} users")
            for user_id in disconnected_users_in_thread:
                self.disconnect_chat(thread_id, user_id)
        else:
            logger.debug(f"No active connections for chat thread {thread_id}")


    async def _start_ping_for_connection(self, ping_key: str, connection_info: ConnectionInfo):
        """Запустить ping для поддержания соединения."""
        if ping_key in self._ping_tasks: # Предотвращаем дублирование ping task
            logger.warning(f"Ping task for {ping_key} already exists. Not starting a new one.")
            return

        async def ping_loop():
            while connection_info.is_alive: # Проверяем флаг is_alive
                try:
                    await asyncio.sleep(self.ping_interval)
                    if not connection_info.is_alive: # Дополнительная проверка перед отправкой
                        break
                    if connection_info.websocket.client_state != WebSocketState.CONNECTED:
                        logger.warning(f"Websocket for {ping_key} is not connected. Stopping ping.")
                        break

                    ping_message = json.dumps({"type": "ping", "timestamp": datetime.now(timezone.utc).isoformat()})
                    await connection_info.websocket.send_text(ping_message)
                    logger.debug(f"Ping sent via {ping_key}")

                except asyncio.CancelledError:
                    logger.info(f"Ping task for {ping_key} cancelled.")
                    break
                except Exception as e:
                    logger.error(f"Error in ping loop for {ping_key}: {e}. Disconnecting.")
                    break # Выход из цикла при ошибке

            # Логика очистки при выходе из цикла ping
            logger.debug(f"Exiting ping loop for {ping_key}. Cleaning up.")
            key_parts = ping_key.split(':')
            connection_info.is_alive = False # Устанавливаем is_alive в False здесь
            # Удаляем task из словаря _ping_tasks только если он там есть и соответствует текущему task
            if self._ping_tasks.get(ping_key) is asyncio.current_task():
                 del self._ping_tasks[ping_key]

            if key_parts[0] == "chat" and len(key_parts) == 3:
                # Проверяем, существует ли еще соединение, прежде чем пытаться его удалить
                if key_parts[1] in self.active_chat_connections and key_parts[2] in self.active_chat_connections[key_parts[1]]:
                    if self.active_chat_connections[key_parts[1]][key_parts[2]] == connection_info:
                         self.disconnect_chat(key_parts[1], key_parts[2])
            elif key_parts[0] == "seller" and len(key_parts) == 2:
                if key_parts[1] in self.active_seller_connections:
                    if self.active_seller_connections[key_parts[1]] == connection_info:
                        self.disconnect_seller_global(key_parts[1])


        task = asyncio.create_task(ping_loop())
        self._ping_tasks[ping_key] = task

    async def _notify_user_joined_chat(self, thread_id: str, user_id: str, user_type: str):
        """Уведомить участников чата о подключении нового пользователя."""
        notification = {
            "type": "user_joined",
            "thread_id": thread_id,
            "user_id": user_id,
            "user_type": user_type,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.broadcast_to_chat_thread(json.dumps(notification), thread_id, exclude_user_id=user_id)

    async def _notify_user_left_chat(self, thread_id: str, user_id: str):
        """Уведомить участников чата об отключении пользователя."""
        logger.info(f"Notifying users in thread {thread_id} that user {user_id} has left.")
        notification = {
            "type": "user_left",
            "thread_id": thread_id,
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.broadcast_to_chat_thread(json.dumps(notification), thread_id)

    async def handle_pong(self, ping_key: str):
        """Обработать pong ответ от клиента."""
        connection_info: Optional[ConnectionInfo] = None
        key_parts = ping_key.split(':')

        if key_parts[0] == "chat" and len(key_parts) == 3:
            thread_id, user_id = key_parts[1], key_parts[2]
            if thread_id in self.active_chat_connections and user_id in self.active_chat_connections[thread_id]:
                connection_info = self.active_chat_connections[thread_id][user_id]
        elif key_parts[0] == "seller" and len(key_parts) == 2:
            seller_id = key_parts[1]
            if seller_id in self.active_seller_connections:
                connection_info = self.active_seller_connections[seller_id]

        if connection_info:
            connection_info.last_ping = datetime.now(timezone.utc)
            logger.debug(f"Pong received for {ping_key}")
        else:
            logger.warning(f"Received pong for non-existent or mismatched connection: {ping_key}")


manager = ConnectionManager()


@router.websocket("/chat/{thread_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    thread_id: str,
    user_id: str, # buyer_id or seller_id
    user_type: str,  # 'buyer' or 'seller'
):
    """WebSocket endpoint для чата."""
    logger.info(f"Chat WebSocket connection attempt: thread_id={thread_id}, user_id={user_id}, user_type={user_type}")
    ping_key = f"chat:{thread_id}:{user_id}"

    if user_type not in ["buyer", "seller"]:
        logger.warning(f"Invalid user_type '{user_type}' for chat. Closing connection.")
        await websocket.close(code=1008) # Policy Violation
        return

    try:
        await manager.connect_chat(websocket, thread_id, user_id, user_type)
        while True:
            try:
                data = await websocket.receive_text()
                logger.debug(f"Received from {user_id} in chat {thread_id}: {data}")
                message_data = json.loads(data)
                message_type = message_data.get("type", "message")

                if message_type == "message":
                    await _handle_chat_message(message_data, thread_id, user_id, user_type)
                elif message_type == "pong":
                    await manager.handle_pong(ping_key)
                elif message_type == "typing":
                    await _handle_typing_indicator(message_data, thread_id, user_id, user_type)
                else:
                    logger.warning(f"Unknown message type '{message_type}' from {user_id} in chat {thread_id}")

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON from {user_id} in chat {thread_id}: {data}")
                # Опционально: отправить ошибку клиенту
            except WebSocketDisconnect:
                logger.info(f"User {user_id} disconnected from chat {thread_id} (WebSocketDisconnect).")
                break
            except Exception as e:
                logger.error(f"Error processing message from {user_id} in chat {thread_id}: {e}")
                # Опционально: отправить ошибку клиенту, если соединение еще живо
                break # Лучше разорвать соединение при неожиданной ошибке

    except Exception as e:
        # Логируем ошибку, возникшую во время connect_chat или в цикле WebSocket
        logger.error(f"Unhandled error in WebSocket chat endpoint for user {user_id}, thread {thread_id}: {e}")
    finally:
        logger.info(f"Cleaning up chat connection for user {user_id} in thread {thread_id}.")
        manager.disconnect_chat(thread_id, user_id)


@router.websocket("/seller/{seller_id}/notifications")
async def websocket_seller_notifications_endpoint(
    websocket: WebSocket,
    seller_id: str,
):
    """WebSocket endpoint для глобальных уведомлений продавца."""
    logger.info(f"Seller global WebSocket connection attempt: seller_id={seller_id}")
    ping_key = f"seller:{seller_id}"

    try:
        await manager.connect_seller_global(websocket, seller_id)
        while True:
            try:
                data = await websocket.receive_text()
                logger.debug(f"Received from seller {seller_id} on global channel: {data}")
                message_data = json.loads(data)
                message_type = message_data.get("type")

                if message_type == "pong":
                    await manager.handle_pong(ping_key)
                else:
                    logger.warning(f"Unknown message type '{message_type}' from seller {seller_id} on global channel. Data: {data}")

            except json.JSONDecodeError:
                logger.error(f"Invalid JSON from seller {seller_id} on global channel: {data}")
            except WebSocketDisconnect:
                logger.info(f"Seller {seller_id} disconnected from global notifications channel (WebSocketDisconnect).")
                break
            except Exception as e:
                logger.error(f"Error processing message from seller {seller_id} on global channel: {e}")
                break
    except Exception as e:
        logger.error(f"Unhandled error in WebSocket seller notifications endpoint for seller {seller_id}: {e}")
    finally:
        logger.info(f"Cleaning up global seller connection for {seller_id}.")
        manager.disconnect_seller_global(seller_id)


async def _handle_chat_message(message_data: dict, thread_id: str, sender_id: str, sender_type: str):
    """Обработать обычное сообщение чата."""
    try:
        # Предполагается, что ChatService сохраняет сообщение и возвращает его DTO
        # Здесь мы просто пересылаем полученное, добавив серверную информацию
        # В реальном приложении здесь была бы логика сохранения сообщения в БД через ChatService
        ws_message_content = {
            "type": "message",
            "thread_id": thread_id,
            "sender_id": sender_id,
            "sender_type": sender_type,
            "message": message_data.get("message", ""),
            "timestamp": message_data.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "message_id": message_data.get("message_id") # Клиент может прислать временный ID
        }
        # Валидация через DTO если нужно, но для простоты сейчас опускаем
        # validated_message = WebSocketMessageDTO(**ws_message_content)

        logger.debug(f"Broadcasting chat message to thread {thread_id} from {sender_id}")
        await manager.broadcast_to_chat_thread(
            json.dumps(ws_message_content), # validated_message.model_dump_json()
            thread_id,
            # exclude_user_id=sender_id # Не исключаем отправителя, чтобы он тоже получил подтверждение через WS
        )
    except Exception as e:
        logger.error(f"Error handling chat message from {sender_id} in thread {thread_id}: {e}")

async def _handle_typing_indicator(message_data: dict, thread_id: str, sender_id: str, sender_type: str):
    """Обработать индикатор печатания в чате."""
    try:
        typing_message = {
            "type": "typing",
            "thread_id": thread_id,
            "sender_id": sender_id,
            "sender_type": sender_type,
            "is_typing": message_data.get("is_typing", False),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await manager.broadcast_to_chat_thread(
            json.dumps(typing_message),
            thread_id,
            exclude_user_id=sender_id
        )
    except Exception as e:
        logger.error(f"Error handling typing indicator from {sender_id} in thread {thread_id}: {e}")


# Функции для отправки уведомлений из других частей приложения
async def notify_new_chat_message_via_ws(thread_id: str, message_dto: WebSocketMessageDTO):
    """
    Уведомить участников треда о НОВОМ сообщении (например, после сохранения в БД).
    Это для серверных инициированных обновлений.
    """
    try:
        logger.info(f"Attempting to notify thread {thread_id} about new message_id: {message_dto.message_id}")
        await manager.broadcast_to_chat_thread(
            message_dto.model_dump_json(),
            thread_id
            # не исключаем никого, все должны получить это серверное уведомление
        )
    except Exception as e:
        logger.error(f"Error notifying new chat message for thread {thread_id} via WS: {e}")

async def send_global_seller_notification(seller_id: str, notification_data: dict):
    """
    Отправить общее уведомление продавцу (не связано с конкретным чатом).
    notification_data должно быть словарем, который будет преобразован в JSON.
    Пример: {"type": "new_order", "order_id": "xyz123", ...}
    """
    try:
        logger.info(f"Attempting to send global notification to seller {seller_id}. Data: {notification_data}")
        # Убедимся, что есть 'type' в уведомлении
        if "type" not in notification_data:
            logger.error("Notification data must include a 'type' field.")
            return False # или raise ValueError

        # Добавляем временную метку, если ее нет
        notification_data.setdefault("timestamp", datetime.now(timezone.utc).isoformat())

        await manager.send_notification_to_seller(
            json.dumps(notification_data),
            seller_id
        )
        return True
    except Exception as e:
        logger.error(f"Error sending global seller notification to {seller_id}: {e}")
        return False

# Пример использования глобальной функции уведомления продавца (вызывается из другого модуля):
# async def some_order_service_function(order: Order):
#     # ... логика создания заказа ...
#     if order.seller_id:
#         notification_payload = {
#             "type": "new_order_received",
#             "order_id": str(order.id),
#             "buyer_id": str(order.buyer_id),
#             "total_amount": order.total_amount,
#             "item_count": len(order.items)
#         }
#         await send_global_seller_notification(str(order.seller_id), notification_payload)
#     return order
#
# Пример использования функции уведомления о новом сообщении в чате (вызывается из chat_service):
# async def create_new_chat_message_in_service(db_message: ChatMessage):
#     # ... логика сохранения сообщения ...
#     message_ws_dto = WebSocketMessageDTO(
#         type="message", # или "message_confirmation" / "new_message"
#         message_id=str(db_message.id),
#         thread_id=str(db_message.thread_id),
#         sender_id=str(db_message.sender_id),
#         sender_type=db_message.sender_type.value, # Assuming sender_type is an enum
#         message=db_message.content,
#         timestamp=db_message.created_at.isoformat(),
#         # Может содержать и другие поля, например, read_status и т.д.
#     )
#     await notify_new_chat_message_via_ws(str(db_message.thread_id), message_ws_dto)
#     return db_message
