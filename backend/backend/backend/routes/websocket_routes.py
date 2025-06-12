import json
import logging
from uuid import UUID
from typing import Dict, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from fastapi.websockets import WebSocketState

from backend.daos import GetDAOs
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
        if thread_id in self.active_connections:
            disconnected_users = []
            
            for user_id, websocket in self.active_connections[thread_id].items():
                if exclude_user and user_id == exclude_user:
                    continue
                
                if websocket.client_state == WebSocketState.CONNECTED:
                    try:
                        await websocket.send_text(message)
                    except Exception as e:
                        logger.error(f"Error broadcasting to {user_id}: {e}")
                        disconnected_users.append(user_id)
                else:
                    disconnected_users.append(user_id)
            
            # Удаляем отключенных пользователей
            for user_id in disconnected_users:
                self.disconnect(thread_id, user_id)

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
    daos: GetDAOs = Depends(),
):
    """WebSocket endpoint для чата."""
    chat_service = ChatService(daos)
    
    # Проверяем, что тред существует и пользователь является участником
    try:
        thread_uuid = UUID(thread_id)
        thread = await daos.chat_thread.filter_first(id=thread_uuid)
        if not thread:
            await websocket.close(code=4004, reason="Thread not found")
            return
        
        user_uuid = UUID(user_id)
        if user_type == "buyer" and thread.buyer_id != user_uuid:
            await websocket.close(code=4003, reason="Access denied")
            return
        elif user_type == "seller" and thread.seller_id != user_uuid:
            await websocket.close(code=4003, reason="Access denied")
            return
            
    except ValueError:
        await websocket.close(code=4000, reason="Invalid UUID")
        return
    except Exception as e:
        logger.error(f"Error validating thread access: {e}")
        await websocket.close(code=4001, reason="Validation error")
        return

    # Подключаем пользователя
    await manager.connect(websocket, thread_id, user_id)
    
    # Уведомляем других участников о подключении
    join_message = chat_service.create_websocket_message(
        message_type="user_joined",
        thread_id=thread_uuid,
        sender_id=user_uuid,
        sender_type=user_type
    )
    await manager.broadcast_to_thread(
        join_message.model_dump_json(),
        thread_id,
        exclude_user=user_id
    )

    try:
        while True:
            # Получаем сообщение от клиента
            data = await websocket.receive_text()
            
            try:
                message_data = json.loads(data)
                message_type = message_data.get("type", "message")
                
                if message_type == "message":
                    # Создаем WebSocket сообщение для рассылки
                    ws_message = chat_service.create_websocket_message(
                        message_type="message",
                        thread_id=thread_uuid,
                        sender_id=user_uuid,
                        sender_type=user_type,
                        message=message_data.get("message", "")
                    )
                    
                    # Рассылаем сообщение всем участникам треда
                    await manager.broadcast_to_thread(
                        ws_message.model_dump_json(),
                        thread_id
                    )
                    
                elif message_type == "typing":
                    # Уведомление о наборе текста
                    typing_message = chat_service.create_websocket_message(
                        message_type="typing",
                        thread_id=thread_uuid,
                        sender_id=user_uuid,
                        sender_type=user_type
                    )
                    
                    await manager.broadcast_to_thread(
                        typing_message.model_dump_json(),
                        thread_id,
                        exclude_user=user_id
                    )
                    
            except json.JSONDecodeError:
                logger.error(f"Invalid JSON received from {user_id}")
            except Exception as e:
                logger.error(f"Error processing message from {user_id}: {e}")

    except WebSocketDisconnect:
        manager.disconnect(thread_id, user_id)
        
        # Уведомляем других участников об отключении
        leave_message = chat_service.create_websocket_message(
            message_type="user_left",
            thread_id=thread_uuid,
            sender_id=user_uuid,
            sender_type=user_type
        )
        await manager.broadcast_to_thread(
            leave_message.model_dump_json(),
            thread_id
        )
        
        logger.info(f"User {user_id} disconnected from thread {thread_id}")
    except Exception as e:
        logger.error(f"Unexpected error in websocket for user {user_id}: {e}")
        manager.disconnect(thread_id, user_id)


# Функция для отправки уведомлений о новых сообщениях
async def notify_new_message(thread_id: str, message_data: WebSocketMessageDTO):
    """Уведомить участников треда о новом сообщении."""
    await manager.broadcast_to_thread(
        message_data.model_dump_json(),
        thread_id
    )
