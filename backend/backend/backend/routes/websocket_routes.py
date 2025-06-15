import json
import logging
from uuid import UUID
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from fastapi.websockets import WebSocketState

from backend.daos import GetDAOsWebSocket
from backend.services.chat_service import ChatService
from backend.dtos.chat_message_dtos import WebSocketMessageDTO

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws")

# Хранилище активных WebSocket соединений
# Структура: {thread_id: {user_id: websocket}}
active_connections: Dict[str, Dict[str, WebSocket]] = {}


class ConnectionManager:
    """Менеджер WebSocket соединений для чата."""

    def __init__(self):
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, thread_id: str, user_id: str):
        """Подключить пользователя к чат-треду."""
        await websocket.accept()
        
        if thread_id not in self.active_connections:
            self.active_connections[thread_id] = {}
        
        self.active_connections[thread_id][user_id] = websocket
        logger.info(f"User {user_id} connected to thread {thread_id}")

    def disconnect(self, thread_id: str, user_id: str):
        """Отключить пользователя от чат-треда."""
        if thread_id in self.active_connections:
            if user_id in self.active_connections[thread_id]:
                del self.active_connections[thread_id][user_id]
                logger.info(f"User {user_id} disconnected from thread {thread_id}")
            
            # Удаляем тред, если в нем нет активных соединений
            if not self.active_connections[thread_id]:
                del self.active_connections[thread_id]

    async def send_personal_message(self, message: str, thread_id: str, user_id: str):
        """Отправить сообщение конкретному пользователю."""
        if (thread_id in self.active_connections and 
            user_id in self.active_connections[thread_id]):
            websocket = self.active_connections[thread_id][user_id]
            if websocket.client_state == WebSocketState.CONNECTED:
                try:
                    await websocket.send_text(message)
                except Exception as e:
                    logger.error(f"Error sending message to {user_id}: {e}")
                    self.disconnect(thread_id, user_id)

    async def broadcast_to_thread(self, message: str, thread_id: str, exclude_user: str = None):
        """Отправить сообщение всем участникам треда, кроме исключенного пользователя."""
        print(f"[WEBSOCKET] Broadcasting to thread {thread_id}, exclude_user={exclude_user}")
        print(f"[WEBSOCKET] Active connections: {list(self.active_connections.get(thread_id, {}).keys())}")

        if thread_id in self.active_connections:
            disconnected_users = []
            sent_count = 0

            for user_id, websocket in self.active_connections[thread_id].items():
                if exclude_user and user_id == exclude_user:
                    print(f"[WEBSOCKET] Skipping excluded user: {user_id}")
                    continue

                if websocket.client_state == WebSocketState.CONNECTED:
                    try:
                        await websocket.send_text(message)
                        sent_count += 1
                        print(f"[WEBSOCKET] Message sent to user: {user_id}")
                    except Exception as e:
                        print(f"[WEBSOCKET] Error broadcasting to {user_id}: {e}")
                        logger.error(f"Error broadcasting to {user_id}: {e}")
                        disconnected_users.append(user_id)
                else:
                    print(f"[WEBSOCKET] User {user_id} not connected, removing")
                    disconnected_users.append(user_id)

            print(f"[WEBSOCKET] Broadcast complete: sent to {sent_count} users")

            # Удаляем отключенных пользователей
            for user_id in disconnected_users:
                self.disconnect(thread_id, user_id)
        else:
            print(f"[WEBSOCKET] No active connections for thread {thread_id}")

    def get_thread_users(self, thread_id: str) -> Set[str]:
        """Получить список активных пользователей в треде."""
        if thread_id in self.active_connections:
            return set(self.active_connections[thread_id].keys())
        return set()


manager = ConnectionManager()


@router.websocket("/chat/{thread_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    thread_id: str,
    user_id: str,
    user_type: str,  # 'buyer' or 'seller'
):
    """WebSocket endpoint для чата."""
    print(f"[WEBSOCKET] ENTRY: thread_id={thread_id}, user_id={user_id}, user_type={user_type}")

    # FastAPI автоматически принимает WebSocket соединение
    print(f"[WEBSOCKET] WebSocket connection ready for {user_id}")

    # Подключаем пользователя к менеджеру
    await manager.connect(websocket, thread_id, user_id)
    print(f"[WEBSOCKET] User {user_id} connected to thread {thread_id}")

    try:
        while True:
            data = await websocket.receive_text()
            print(f"[WEBSOCKET] Received from {user_id}: {data}")

            try:
                message_data = json.loads(data)
                message_type = message_data.get("type", "message")

                if message_type == "message":
                    # Создаем WebSocket сообщение для рассылки
                    ws_message = {
                        "type": "message",
                        "thread_id": thread_id,
                        "sender_id": user_id,
                        "sender_type": user_type,
                        "message": message_data.get("message", ""),
                        "timestamp": message_data.get("timestamp", ""),
                        "message_id": message_data.get("message_id")
                    }

                    print(f"[WEBSOCKET] Broadcasting message to thread {thread_id}")

                    # Рассылаем сообщение всем участникам треда
                    await manager.broadcast_to_thread(
                        json.dumps(ws_message),
                        thread_id
                    )

            except json.JSONDecodeError:
                print(f"[WEBSOCKET] Invalid JSON from {user_id}: {data}")
            except Exception as e:
                print(f"[WEBSOCKET] Error processing message from {user_id}: {e}")

    except WebSocketDisconnect:
        print(f"[WEBSOCKET] User {user_id} disconnected from thread {thread_id}")
    except Exception as e:
        print(f"[WEBSOCKET] Unexpected error for {user_id}: {e}")
    finally:
        manager.disconnect(thread_id, user_id)
        print(f"[WEBSOCKET] Cleaned up connection for {user_id}")



# Функция для отправки уведомлений о новых сообщениях
async def notify_new_message(thread_id: str, message_data: WebSocketMessageDTO):
    """Уведомить участников треда о новом сообщении."""
    await manager.broadcast_to_thread(
        message_data.model_dump_json(),
        thread_id
    )
