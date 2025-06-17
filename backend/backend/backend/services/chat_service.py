from uuid import UUID, uuid4
from datetime import datetime, timezone

from backend.daos import AllDAOs
from backend.dtos.chat_message_dtos import (
    ChatMessageInputDTO,
    StartChatDTO,
    WebSocketMessageDTO,
)
from backend.dtos.chat_thread_dtos import (
    ChatThreadInputDTO,
    ChatThreadWithLastMessageDTO,
)
from backend.models.chat_thread_models import ChatThread
from backend.models.chat_message_models import ChatMessage


class ChatService:
    """Service for chat business logic."""

    def __init__(self, daos: AllDAOs):
        self.daos = daos

    async def start_chat_with_seller(self, start_chat_dto: StartChatDTO) -> ChatThread:
        """Start a new chat thread between buyer and seller."""
        # Проверяем, существует ли уже тред между этими пользователями
        existing_thread = await self.daos.chat_thread.find_existing_thread(
            buyer_id=start_chat_dto.buyer_id,
            seller_id=start_chat_dto.seller_id
        )
        
        if existing_thread:
            return existing_thread
        
        # Создаем новый тред
        thread_input = ChatThreadInputDTO(
            id=uuid4(),
            buyer_id=start_chat_dto.buyer_id,
            seller_id=start_chat_dto.seller_id
        )
        
        return await self.daos.chat_thread.create(thread_input)

    async def get_buyer_chats(self, buyer_id: UUID) -> list[ChatThreadWithLastMessageDTO]:
        """Get all chat threads for a buyer with last message info."""
        threads_data = await self.daos.chat_thread.get_threads_with_last_message(
            user_id=buyer_id,
            user_type="buyer"
        )
        
        return [ChatThreadWithLastMessageDTO(**thread_data) for thread_data in threads_data]

    async def get_seller_chats(self, seller_id: UUID) -> list[ChatThreadWithLastMessageDTO]:
        """Get all chat threads for a seller with last message info."""
        threads_data = await self.daos.chat_thread.get_threads_with_last_message(
            user_id=seller_id,
            user_type="seller"
        )
        
        return [ChatThreadWithLastMessageDTO(**thread_data) for thread_data in threads_data]

    async def send_message(self, message_input: ChatMessageInputDTO) -> ChatMessage:
        """Send a message in a chat thread."""
        # Проверяем, что тред существует
        thread = await self.daos.chat_thread.filter_first(id=message_input.thread_id)
        if not thread:
            raise ValueError("Chat thread not found")

        # Проверяем, что указан только один отправитель (buyer_id ИЛИ seller_id, но не оба)
        if (message_input.buyer_id is not None and message_input.seller_id is not None):
            raise ValueError("Message can have only one sender (buyer_id OR seller_id)")

        if (message_input.buyer_id is None and message_input.seller_id is None):
            raise ValueError("Message must have a sender (buyer_id OR seller_id)")

        # Проверяем, что отправитель является участником треда
        if message_input.buyer_id is not None:
            if message_input.buyer_id != thread.buyer_id:
                raise ValueError("Buyer is not a participant of this chat thread")

        if message_input.seller_id is not None:
            if message_input.seller_id != thread.seller_id:
                raise ValueError("Seller is not a participant of this chat thread")

        # Создаем сообщение в базе данных
        created_message = await self.daos.chat_message.create(message_input)

        # Отправляем WebSocket уведомление
        try:
            from backend.routes.websocket_routes import notify_new_message
            import asyncio
            import json

            # Определяем отправителя
            sender_id = message_input.buyer_id if message_input.buyer_id else message_input.seller_id
            sender_type = "buyer" if message_input.buyer_id else "seller"

            # Создаем простое WebSocket сообщение как словарь
            ws_message_data = {
                "type": "message",
                "thread_id": str(message_input.thread_id),
                "sender_id": str(sender_id),
                "sender_type": sender_type,
                "message": message_input.message,
                "message_id": str(message_input.id),
                "timestamp": created_message.created_at.isoformat() if created_message.created_at else None
            }

            # Создаем простой объект для передачи
            class SimpleWebSocketMessage:
                def model_dump_json(self):
                    return json.dumps(ws_message_data)

            ws_message = SimpleWebSocketMessage()

            # Отправляем через WebSocket асинхронно
            asyncio.create_task(notify_new_message(str(message_input.thread_id), ws_message))

        except Exception as e:
            # Логируем ошибку, но не прерываем выполнение
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send WebSocket notification: {e}")

        return created_message

    async def get_thread_messages(self, thread_id: UUID, limit: int = 50) -> list[ChatMessage]:
        """Get messages for a specific thread."""
        return await self.daos.chat_message.get_by_thread_id(thread_id, limit)

    async def mark_messages_as_read(
        self, 
        thread_id: UUID, 
        user_id: UUID, 
        user_type: str
    ) -> None:
        """Mark messages as read for a user."""
        if user_type == "buyer":
            await self.daos.chat_message.mark_as_read_by_buyer(thread_id, user_id)
        elif user_type == "seller":
            await self.daos.chat_message.mark_as_read_by_seller(thread_id, user_id)
        else:
            raise ValueError("Invalid user type")

    async def get_unread_count(
        self, 
        user_id: UUID, 
        user_type: str, 
        thread_id: UUID | None = None
    ) -> int:
        """Get unread message count for a user."""
        if user_type == "buyer":
            return await self.daos.chat_message.count_unread_for_buyer(user_id, thread_id)
        elif user_type == "seller":
            return await self.daos.chat_message.count_unread_for_seller(user_id, thread_id)
        else:
            raise ValueError("Invalid user type")

    def create_websocket_message(
        self,
        message_type: str,
        thread_id: UUID,
        sender_id: UUID,
        sender_type: str,
        message: str | None = None,
        message_id: UUID | None = None
    ) -> WebSocketMessageDTO:
        """Create a WebSocket message DTO."""
        return WebSocketMessageDTO(
            type=message_type,
            thread_id=thread_id,
            sender_id=sender_id,
            sender_type=sender_type,
            message=message,
            timestamp=datetime.now(timezone.utc),
            message_id=message_id
        )
