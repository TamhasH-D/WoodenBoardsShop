import json
import logging
import asyncio
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
        self.last_ping = datetime.now(timezone.utc) # Initialized to connection time, updated on pong
        self.is_alive = True


class ConnectionManager:
    """Улучшенный менеджер WebSocket соединений для чата."""

    def __init__(self):
        # Структура: {thread_id: {user_id: ConnectionInfo}}
        self.active_connections: Dict[str, Dict[str, ConnectionInfo]] = {}
        self.ping_interval = 30  # Интервал ping в секундах (e.g., 30 seconds)
        self.ping_timeout = 10   # Таймаут ответа на ping (e.g., 10 seconds)
                                 # Total unresponsiveness window = interval + timeout (e.g., 40s)
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
                    # Mark old connection as not alive to stop its ping loop gracefully if possible
                    old_connection.is_alive = False
                    await old_connection.websocket.close()
                    logger.info(f"Closed previous connection for user {user_id} in thread {thread_id}")
                except Exception as e:
                    logger.warning(f"Error closing old connection for {user_id} in {thread_id}: {e}")

                old_ping_key = f"{thread_id}:{user_id}"
                if old_ping_key in self._ping_tasks:
                    self._ping_tasks[old_ping_key].cancel()
                    try:
                        await self._ping_tasks[old_ping_key] # Allow task to process cancellation
                    except asyncio.CancelledError:
                        logger.debug(f"Cancelled old ping task for {user_id} in {thread_id}")
                    except Exception as e:
                        logger.error(f"Error awaiting old ping task cancellation for {user_id}: {e}")
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
            # Ensure cleanup if accept() succeeded but subsequent steps failed
            if websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await websocket.close(code=1011) # Internal error
                except Exception as close_e:
                    logger.error(f"Error closing websocket during connect error for {user_id}: {close_e}")
            raise # Re-raise to be handled by FastAPI/caller

    def disconnect(self, thread_id: str, user_id: str):
        """Отключить пользователя от чат-треда. Idempotent."""
        try:
            connection_to_remove: Optional[ConnectionInfo] = None
            if thread_id in self.active_connections and user_id in self.active_connections[thread_id]:
                connection_to_remove = self.active_connections[thread_id][user_id]
                connection_to_remove.is_alive = False # Signal to any running tasks to stop

                # Останавливаем ping task
                ping_task_key = f"{thread_id}:{user_id}"
                if ping_task_key in self._ping_tasks:
                    task = self._ping_tasks.pop(ping_task_key) # Remove before cancelling
                    task.cancel()
                    # Schedule await for task cancellation to avoid blocking here
                    # asyncio.create_task(self._await_task_cancellation(task, "ping", user_id, thread_id))
                    logger.debug(f"Ping task for {user_id} in thread {thread_id} cancelled.")

                del self.active_connections[thread_id][user_id]
                logger.info(f"User {user_id} removed from active connections in thread {thread_id}")

            # Close WebSocket if it's still open and belongs to the connection being disconnected
            if connection_to_remove and connection_to_remove.websocket.client_state == WebSocketState.CONNECTED:
                asyncio.create_task(self._close_websocket_connection(connection_to_remove.websocket, user_id, thread_id))

            if thread_id in self.active_connections and not self.active_connections[thread_id]:
                del self.active_connections[thread_id]
                logger.info(f"Thread {thread_id} removed (no active connections remaining)")
            elif thread_id in self.active_connections: # Only notify if thread still exists
                 # Уведомляем оставшихся участников об отключении
                asyncio.create_task(self._notify_user_left(thread_id, user_id))

        except Exception as e:
            logger.error(f"Error disconnecting user {user_id} from thread {thread_id}: {e}")

    async def _close_websocket_connection(self, websocket: WebSocket, user_id: str, thread_id: str):
        try:
            await websocket.close()
            logger.info(f"WebSocket connection closed for user {user_id} in thread {thread_id}")
        except Exception as e:
            logger.warning(f"Error closing WebSocket for user {user_id} in thread {thread_id}: {e}")

    # async def _await_task_cancellation(self, task: asyncio.Task, task_name: str, user_id: str, thread_id: str):
    #     try:
    #         await task
    #     except asyncio.CancelledError:
    #         logger.debug(f"{task_name} task for {user_id} in {thread_id} successfully processed cancellation.")
    #     except Exception as e:
    #         logger.error(f"Error during {task_name} task shutdown for {user_id} in {thread_id}: {e}")


    async def send_personal_message(self, message: str, thread_id: str, user_id: str):
        """Отправить сообщение конкретному пользователю."""
        if thread_id in self.active_connections and user_id in self.active_connections[thread_id]:
            connection_info = self.active_connections[thread_id][user_id]
            if connection_info.is_alive and connection_info.websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await connection_info.websocket.send_text(message)
                    logger.debug(f"Personal message sent to {user_id} in thread {thread_id}")
                except Exception as e:
                    logger.error(f"Error sending personal message to {user_id} in thread {thread_id}: {e}")
                    self.disconnect(thread_id, user_id) # Disconnect on send error

    async def broadcast_to_thread(self, message: str, thread_id: str, exclude_user: Optional[str] = None):
        """Отправить сообщение всем участникам треда."""
        logger.debug(f"Broadcasting to thread {thread_id}, exclude_user={exclude_user}")
        if thread_id in self.active_connections:
            # Iterate over a copy of user_ids in case disconnect modifies the dict during iteration
            user_ids_in_thread = list(self.active_connections[thread_id].keys())
            disconnected_during_broadcast: Set[str] = set()

            for user_id in user_ids_in_thread:
                if user_id == exclude_user:
                    logger.debug(f"Skipping excluded user for broadcast: {user_id}")
                    continue

                # Check if user is still connected (might have been disconnected by another task)
                if thread_id not in self.active_connections or \
                   user_id not in self.active_connections[thread_id] or \
                   user_id in disconnected_during_broadcast:
                    continue

                connection_info = self.active_connections[thread_id][user_id]
                if connection_info.is_alive and connection_info.websocket.client_state == WebSocketState.CONNECTED:
                    try:
                        await connection_info.websocket.send_text(message)
                        logger.debug(f"Broadcast message sent to user: {user_id} in thread {thread_id}")
                    except Exception as e:
                        logger.error(f"Error broadcasting to {user_id} in thread {thread_id}: {e}. Marking for disconnect.")
                        disconnected_during_broadcast.add(user_id)
                else:
                    logger.debug(f"User {user_id} in thread {thread_id} not connected or not alive, marking for disconnect.")
                    disconnected_during_broadcast.add(user_id)

            for user_id_to_disconnect in disconnected_during_broadcast:
                self.disconnect(thread_id, user_id_to_disconnect)
        else:
            logger.debug(f"No active connections for thread {thread_id} to broadcast.")


    def get_thread_users(self, thread_id: str) -> Set[str]:
        """Получить список активных пользователей в треде."""
        if thread_id in self.active_connections:
            return set(self.active_connections[thread_id].keys())
        return set()

    async def _start_ping_for_connection(self, thread_id: str, user_id: str):
        """Запустить ping для поддержания соединения."""
        ping_task_key = f"{thread_id}:{user_id}"
        if ping_task_key in self._ping_tasks: # Should not happen if old tasks are properly cleaned up
             logger.warning(f"Ping task for {user_id} in {thread_id} already exists. Cancelling old one.")
             old_task = self._ping_tasks.pop(ping_task_key)
             old_task.cancel()

        async def ping_loop():
            while True:
                await asyncio.sleep(self.ping_interval)

                # Ensure connection still exists and is marked as alive before proceeding
                if thread_id not in self.active_connections or \
                   user_id not in self.active_connections[thread_id]:
                    logger.debug(f"Ping loop for {user_id} in {thread_id}: connection or thread not found in active_connections. Exiting.")
                    break

                connection_info = self.active_connections[thread_id][user_id]
                if not connection_info.is_alive: # is_alive can be set to False by disconnect()
                    logger.debug(f"Ping loop for {user_id} in {thread_id}: connection marked not alive. Exiting.")
                    break

                # Check if client has been unresponsive from the *previous* ping cycle
                # last_ping is updated upon receiving a pong.
                # If now - last_ping > interval + timeout, it means pong for previous ping wasn't received in time.
                if (datetime.now(timezone.utc) - connection_info.last_ping).total_seconds() > (self.ping_interval + self.ping_timeout):
                    logger.warning(
                        f"User {user_id} in thread {thread_id} timed out. "
                        f"Last pong was at {connection_info.last_ping} (UTC). Current time {datetime.now(timezone.utc)} (UTC). "
                        f"Exceeded threshold of {self.ping_interval + self.ping_timeout}s. Disconnecting."
                    )
                    self.disconnect(thread_id, user_id) # This will also cancel this ping_task from _ping_tasks
                    break # Exit the ping_loop for this user

                try:
                    # Send current cycle's ping
                    ping_message = json.dumps({"type": "ping", "timestamp": datetime.now(timezone.utc).isoformat()})
                    if connection_info.websocket.client_state == WebSocketState.CONNECTED:
                        await connection_info.websocket.send_text(ping_message)
                        logger.debug(f"Ping sent to {user_id} in thread {thread_id}")
                    else:
                        logger.warning(f"Ping loop for {user_id} in {thread_id}: WebSocket no longer connected before sending ping. Disconnecting.")
                        self.disconnect(thread_id, user_id)
                        break
                except Exception as e: # Covers WebSocketClosed, ConnectionClosed, etc.
                    logger.error(f"Error sending ping to {user_id} in thread {thread_id}: {e}. Disconnecting.")
                    self.disconnect(thread_id, user_id)
                    break
            logger.debug(f"Ping loop for {user_id} in {thread_id} has ended.")

        task = asyncio.create_task(ping_loop())
        self._ping_tasks[ping_task_key] = task
        # Add callback to remove task from dict when it's done (e.g. via break)
        task.add_done_callback(lambda t: self._ping_tasks.pop(ping_task_key, None) if ping_task_key in self._ping_tasks else None)


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
        # Ensure not to broadcast if thread itself was removed because it became empty
        if thread_id in self.active_connections and self.active_connections[thread_id]:
            await self.broadcast_to_thread(json.dumps(notification), thread_id)
        else:
            logger.debug(f"Skipping user_left notification for {user_id} in {thread_id} as thread is empty or removed.")


    async def handle_pong(self, thread_id: str, user_id: str):
        """Обработать pong ответ от клиента."""
        if thread_id in self.active_connections and user_id in self.active_connections[thread_id]:
            connection_info = self.active_connections[thread_id][user_id]
            if connection_info.is_alive: # Only update if connection is supposed to be alive
                connection_info.last_ping = datetime.now(timezone.utc)
                logger.debug(f"Pong received from {user_id} in thread {thread_id}. Updated last_ping to {connection_info.last_ping}")
            else:
                logger.debug(f"Pong received from {user_id} in {thread_id}, but connection marked as not alive. Ignoring.")
        else:
            logger.debug(f"Pong received from {user_id} in {thread_id}, but connection not found in active_connections. Ignoring.")


manager = ConnectionManager()


@router.websocket("/chat/{thread_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    thread_id: str,
    user_id: str, # Should ideally come from authenticated token in real app
    user_type: str,  # 'buyer' or 'seller', also from token/session
):
    """Улучшенный WebSocket endpoint для чата."""
    logger.info(f"WebSocket connection attempt: thread_id={thread_id}, user_id={user_id}, user_type={user_type}")

    try:
        await manager.connect(websocket, thread_id, user_id, user_type)
        logger.info(f"User {user_id} successfully connected to thread {thread_id}")

        while websocket.client_state == WebSocketState.CONNECTED and \
              thread_id in manager.active_connections and \
              user_id in manager.active_connections[thread_id] and \
              manager.active_connections[thread_id][user_id].is_alive:
            try:
                data = await websocket.receive_text()
                logger.debug(f"Received from {user_id} in thread {thread_id}: {data}")

                try:
                    message_data = json.loads(data)
                    message_type = message_data.get("type", "message")

                    if message_type == "message":
                        await _handle_chat_message(message_data, thread_id, user_id, user_type)
                    elif message_type == "pong":
                        await manager.handle_pong(thread_id, user_id)
                    elif message_type == "typing":
                        await _handle_typing_indicator(message_data, thread_id, user_id, user_type)
                    else:
                        logger.warning(f"Unknown message type '{message_type}' from {user_id} in thread {thread_id}")

                except json.JSONDecodeError:
                    logger.error(f"Invalid JSON from {user_id} in thread {thread_id}: {data}")
                    # Consider sending an error message back to this specific user
                    # error_payload = {"type": "error", "detail": "Invalid JSON format"}
                    # await manager.send_personal_message(json.dumps(error_payload), thread_id, user_id)
                except Exception as e: # Catch other errors during message processing
                    logger.error(f"Error processing message from {user_id} in thread {thread_id}: {e}")
                    # error_payload = {"type": "error", "detail": "Error processing message"}
                    # await manager.send_personal_message(json.dumps(error_payload), thread_id, user_id)


            except WebSocketDisconnect:
                logger.info(f"WebSocket disconnected for user {user_id} in thread {thread_id} (client initiated).")
                break # Exit loop on graceful disconnect
            except Exception as e: # Catch unexpected errors in receive_text or main loop
                logger.error(f"Unexpected error in WebSocket loop for {user_id} in {thread_id}: {e}")
                break # Exit loop

    except Exception as e: # Catch errors from manager.connect or initial setup
        logger.error(f"Critical error during WebSocket setup or handling for user {user_id} in thread {thread_id}: {e}")
        # WebSocket may or may not be accepted at this point. If it is, try to close it.
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.close(code=1011) # Internal server error
    finally:
        logger.info(f"Cleaning up connection for user {user_id} in thread {thread_id} in finally block.")
        manager.disconnect(thread_id, user_id) # Ensures cleanup in all cases


async def _handle_chat_message(message_data: dict, thread_id: str, user_id: str, user_type: str):
    """Обработать обычное сообщение чата."""
    # This function's responsibility is mainly to construct the message for broadcast.
    # Actual saving to DB should happen via an HTTP route to ensure consistency and RESTful principles.
    # Websockets here are for real-time forwarding of messages.
    # However, if the design implies WS also saves messages, then GetDAOs and ChatService would be needed here.
    # For now, assuming it just broadcasts.
    try:
        ws_message = {
            "type": "message", # This is the type of the WebSocket message being broadcast
            "thread_id": thread_id,
            "sender_id": user_id,
            "sender_type": user_type,
            "message": message_data.get("message", ""), # Actual chat message content
            "timestamp": message_data.get("timestamp", datetime.now(timezone.utc).isoformat()), # Client may send its own timestamp
            "message_id": message_data.get("message_id") # Client may send a UUID for the message
        }
        logger.debug(f"Broadcasting chat message to thread {thread_id} from {user_id}")
        await manager.broadcast_to_thread(
            json.dumps(ws_message),
            thread_id,
            exclude_user=user_id # Sender does not need to receive their own message back via this broadcast
        )
    except Exception as e:
        logger.error(f"Error handling chat message from {user_id} for broadcast: {e}")


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
        await manager.broadcast_to_thread(
            json.dumps(typing_message),
            thread_id,
            exclude_user=user_id
        )
    except Exception as e:
        logger.error(f"Error handling typing indicator from {user_id}: {e}")


# This function is called by an HTTP route when a message is saved to DB
# to notify WebSocket clients.
async def notify_new_message(thread_id: str, message_data: WebSocketMessageDTO):
    """Уведомить участников треда о новом сообщении (called externally, e.g. after DB save)."""
    # Note: message_data here is WebSocketMessageDTO, which is a specific structure.
    # The original call from ChatService used a simple dict.
    # If this is called from ChatService, ensure message_data matches this DTO or adapt.
    # The current ChatService (after refactor) uses a SimpleWebSocketMessage with model_dump_json.
    # This should align if SimpleWebSocketMessage produces a JSON string compatible with what
    # broadcast_to_thread expects (a string).
    try:
        # If message_data is already a JSON string (from model_dump_json):
        if isinstance(message_data, str):
            json_string_payload = message_data
        elif hasattr(message_data, 'model_dump_json'): # Pydantic v2
            json_string_payload = message_data.model_dump_json()
        elif hasattr(message_data, 'json'): # Pydantic v1 style
            json_string_payload = message_data.json()
        else: # Assume it's a dict
            json_string_payload = json.dumps(message_data)

        logger.info(f"Notifying new message to thread {thread_id}: {json_string_payload}")
        await manager.broadcast_to_thread(
            json_string_payload,
            thread_id
            # For new messages saved to DB, everyone in the thread should receive it,
            # including the original sender (to confirm their message is processed and distributed).
            # So, no exclude_user here.
        )
    except Exception as e:
        logger.error(f"Error in notify_new_message for thread {thread_id}: {e}")
