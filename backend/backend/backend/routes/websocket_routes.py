import json
import logging
import asyncio
import random
from datetime import datetime, timezone
from uuid import UUID
from typing import Dict, Set, Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from fastapi.websockets import WebSocketState

from backend.daos import GetDAOsWebSocket
from backend.services.chat_service import ChatService
from backend.dtos.chat_message_dtos import WebSocketMessageDTO

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws")


class ConnectionInfo:
    """Информация о WebSocket соединении."""

    def __init__(self, websocket: WebSocket, user_id: str, user_type: str):
        self.websocket = websocket
        self.user_id = user_id
        self.user_type = user_type
        self.connected_at = datetime.now(timezone.utc)
        self.last_ping = datetime.now(timezone.utc)
        self.is_alive = True


class ConnectionManager:
    """Улучшенный менеджер WebSocket соединений для чата."""

    def __init__(self):
        # Структура: {thread_id: {user_id: ConnectionInfo}}
        self.active_connections: Dict[str, Dict[str, ConnectionInfo]] = {}
        self.ping_interval = 30  # Интервал ping в секундах
        self.ping_timeout = 30   # Таймаут ответа на ping
        self._ping_tasks: Dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, thread_id: str, user_id: str, user_type: str):
        """Подключить пользователя к чат-треду."""
        try:
            await websocket.accept()
            logger.info(f"WebSocket connection accepted for user {user_id} in thread {thread_id}")

            if thread_id not in self.active_connections:
                self.active_connections[thread_id] = {}

            # Закрываем предыдущее соединение если есть
            if user_id in self.active_connections[thread_id]:
                old_connection = self.active_connections[thread_id][user_id]
                try:
                    await old_connection.websocket.close()
                except:
                    pass
                # Останавливаем старый ping task
                old_ping_key = f"{thread_id}:{user_id}"
                if old_ping_key in self._ping_tasks:
                    self._ping_tasks[old_ping_key].cancel()
                    del self._ping_tasks[old_ping_key]

            connection_info = ConnectionInfo(websocket, user_id, user_type)
            self.active_connections[thread_id][user_id] = connection_info

            # Запускаем ping для этого соединения
            await self._start_ping_for_connection(thread_id, user_id)

            logger.info(f"User {user_id} ({user_type}) connected to thread {thread_id}")

            # Уведомляем других участников о подключении
            await self._notify_user_joined(thread_id, user_id, user_type)

        except Exception as e:
            logger.error(f"Error connecting user {user_id} to thread {thread_id}: {e}")
            raise

    def disconnect(self, thread_id: str, user_id: str):
        """Отключить пользователя от чат-треда."""
        try:
            if thread_id in self.active_connections:
                if user_id in self.active_connections[thread_id]:
                    connection_info = self.active_connections[thread_id][user_id]
                    connection_info.is_alive = False

                    # Останавливаем ping task
                    ping_task_key = f"{thread_id}:{user_id}"
                    if ping_task_key in self._ping_tasks:
                        self._ping_tasks[ping_task_key].cancel()
                        del self._ping_tasks[ping_task_key]

                    del self.active_connections[thread_id][user_id]
                    logger.info(f"User {user_id} disconnected from thread {thread_id}")

                # Удаляем тред, если в нем нет активных соединений
                if not self.active_connections[thread_id]:
                    del self.active_connections[thread_id]
                    logger.info(f"Thread {thread_id} removed (no active connections)")
                else:
                    # Уведомляем оставшихся участников об отключении
                    asyncio.create_task(self._notify_user_left(thread_id, user_id))

        except Exception as e:
            logger.error(f"Error disconnecting user {user_id} from thread {thread_id}: {e}")

    async def send_personal_message(self, message: str, thread_id: str, user_id: str):
        """Отправить сообщение конкретному пользователю."""
        if thread_id in self.active_connections:
            if user_id in self.active_connections[thread_id]:
                connection_info = self.active_connections[thread_id][user_id]
                if connection_info.websocket.client_state == WebSocketState.CONNECTED:
                    try:
                        await connection_info.websocket.send_text(message)
                        logger.debug(f"Personal message sent to {user_id}")
                    except Exception as e:
                        logger.error(f"Error sending message to {user_id}: {e}")
                        self.disconnect(thread_id, user_id)

    async def broadcast_to_thread(self, message: str, thread_id: str, exclude_user: Optional[str] = None):
        """Отправить сообщение всем участникам треда."""
        logger.debug(f"Broadcasting to thread {thread_id}, exclude_user={exclude_user}")

        if thread_id in self.active_connections:
            disconnected_users = []
            sent_count = 0

            for user_id, connection_info in self.active_connections[thread_id].items():
                if exclude_user and user_id == exclude_user:
                    logger.debug(f"Skipping excluded user: {user_id}")
                    continue

                if connection_info.websocket.client_state == WebSocketState.CONNECTED:
                    try:
                        await connection_info.websocket.send_text(message)
                        sent_count += 1
                        logger.debug(f"Message sent to user: {user_id}")
                    except Exception as e:
                        logger.error(f"Error broadcasting to {user_id}: {e}")
                        disconnected_users.append(user_id)
                else:
                    logger.debug(f"User {user_id} not connected, removing")
                    disconnected_users.append(user_id)

            logger.debug(f"Broadcast complete: sent to {sent_count} users")

            # Удаляем отключенных пользователей
            for user_id in disconnected_users:
                self.disconnect(thread_id, user_id)
        else:
            logger.debug(f"No active connections for thread {thread_id}")

    def get_thread_users(self, thread_id: str) -> Set[str]:
        """Получить список активных пользователей в треде."""
        if thread_id in self.active_connections:
            return set(self.active_connections[thread_id].keys())
        return set()

    async def _start_ping_for_connection(self, thread_id: str, user_id: str):
        """Запустить ping для поддержания соединения."""
        ping_task_key = f"{thread_id}:{user_id}"

        async def ping_loop():
            while True:
                try:
                    jitter = random.uniform(0, 5)
                    await asyncio.sleep(self.ping_interval + jitter)

                    if thread_id not in self.active_connections or user_id not in self.active_connections[thread_id]:
                        break

                    connection_info = self.active_connections[thread_id][user_id]
                    if not connection_info.is_alive:
                        break

                    # Отправляем ping
                    ping_message = json.dumps({"type": "ping", "timestamp": datetime.now(timezone.utc).isoformat()})
                    await connection_info.websocket.send_text(ping_message)
                    logger.debug(f"Ping sent to {user_id} in thread {thread_id}")

                except Exception as e:
                    logger.error(f"Error in ping loop for {user_id}: {e}")
                    self.disconnect(thread_id, user_id)
                    break

        task = asyncio.create_task(ping_loop())
        self._ping_tasks[ping_task_key] = task

    async def _notify_user_joined(self, thread_id: str, user_id: str, user_type: str):
        """Уведомить участников о подключении пользователя."""
        notification = {
            "type": "user_joined",
            "thread_id": thread_id,
            "user_id": user_id,
            "user_type": user_type,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.broadcast_to_thread(json.dumps(notification), thread_id, exclude_user=user_id)

    async def _notify_user_left(self, thread_id: str, user_id: str):
        """Уведомить участников об отключении пользователя."""
        notification = {
            "type": "user_left",
            "thread_id": thread_id,
            "user_id": user_id,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.broadcast_to_thread(json.dumps(notification), thread_id)

    async def handle_pong(self, thread_id: str, user_id: str):
        """Обработать pong ответ от клиента."""
        if thread_id in self.active_connections and user_id in self.active_connections[thread_id]:
            connection_info = self.active_connections[thread_id][user_id]
            connection_info.last_ping = datetime.now(timezone.utc)
            logger.debug(f"Pong received from {user_id} in thread {thread_id}")


manager = ConnectionManager()


@router.websocket("/chat/{thread_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    thread_id: str,
    user_id: str,
    user_type: str,  # 'buyer' or 'seller'
):
    """Улучшенный WebSocket endpoint для чата."""
    logger.info(f"WebSocket connection attempt: thread_id={thread_id}, user_id={user_id}, user_type={user_type}")

    try:
        # Подключаем пользователя к менеджеру
        await manager.connect(websocket, thread_id, user_id, user_type)
        logger.info(f"User {user_id} successfully connected to thread {thread_id}")

        # Основной цикл обработки сообщений
        while True:
            try:
                data = await websocket.receive_text()
                logger.debug(f"Received from {user_id}: {data}")

                try:
                    message_data = json.loads(data)
                    message_type = message_data.get("type", "message")

                    if message_type == "message":
                        # Обрабатываем обычное сообщение
                        await _handle_chat_message(message_data, thread_id, user_id, user_type)

                    elif message_type == "pong":
                        # Обрабатываем pong ответ
                        await manager.handle_pong(thread_id, user_id)

                    elif message_type == "typing":
                        # Обрабатываем индикатор печатания
                        await _handle_typing_indicator(message_data, thread_id, user_id, user_type)

                    else:
                        logger.warning(f"Unknown message type '{message_type}' from {user_id}")

                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON from {user_id}: {data}")
                    error_message = json.dumps({
                        "type": "error",
                        "message": "Invalid JSON format",
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    })
                    await manager.send_personal_message(error_message, thread_id, user_id)

            except WebSocketDisconnect:
                logger.info(f"User {user_id} disconnected from thread {thread_id}")
                break
            except Exception as e:
                logger.error(f"Error processing message from {user_id}: {e}")
                # Отправляем ошибку клиенту
                error_message = json.dumps({
                    "type": "error",
                    "message": "Server error processing message",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
                try:
                    await manager.send_personal_message(error_message, thread_id, user_id)
                except:
                    pass

    except Exception as e:
        logger.error(f"Error in WebSocket connection for {user_id}: {e}")
    finally:
        manager.disconnect(thread_id, user_id)
        logger.info(f"Cleaned up connection for {user_id} in thread {thread_id}")


async def _handle_chat_message(message_data: dict, thread_id: str, user_id: str, user_type: str):
    """Обработать обычное сообщение чата."""
    try:
        # Создаем WebSocket сообщение для рассылки
        ws_message = {
            "type": "message",
            "thread_id": thread_id,
            "sender_id": user_id,
            "sender_type": user_type,
            "message": message_data.get("message", ""),
            "timestamp": message_data.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "message_id": message_data.get("message_id")
        }

        logger.debug(f"Broadcasting message to thread {thread_id}")

        # Рассылаем сообщение всем участникам треда, кроме отправителя
        await manager.broadcast_to_thread(
            json.dumps(ws_message),
            thread_id,
            exclude_user=user_id
        )

    except Exception as e:
        logger.error(f"Error handling chat message from {user_id}: {e}")


async def _handle_typing_indicator(message_data: dict, thread_id: str, user_id: str, user_type: str):
    """Обработать индикатор печатания."""
    try:
        typing_message = {
            "type": "typing",
            "thread_id": thread_id,
            "sender_id": user_id,
            "sender_type": user_type,
            "is_typing": message_data.get("is_typing", False),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        # Рассылаем индикатор печатания всем участникам треда, кроме отправителя
        await manager.broadcast_to_thread(
            json.dumps(typing_message),
            thread_id,
            exclude_user=user_id
        )

    except Exception as e:
        logger.error(f"Error handling typing indicator from {user_id}: {e}")


# Функция для отправки уведомлений о новых сообщениях
async def notify_new_message(thread_id: str, message_data: WebSocketMessageDTO):
    """Уведомить участников треда о новом сообщении."""
    try:
        await manager.broadcast_to_thread(
            message_data.model_dump_json(),
            thread_id
        )
    except Exception as e:
        logger.error(f"Error notifying new message for thread {thread_id}: {e}")
