from uuid import UUID, uuid4
from datetime import datetime, timezone

from backend.auth import AuthenticatedUser # Added
from backend.daos import AllDAOs
from backend.dtos.chat_message_dtos import (
    # ChatMessageInputDTO, # No longer used as direct input to service.send_message
    # StartChatDTO, # No longer used by service.start_chat_with_seller
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

    async def start_chat_with_seller(self, current_buyer_db_id: UUID, seller_id: UUID) -> ChatThread:
        """Start a new chat thread between buyer and seller."""
        existing_thread = await self.daos.chat_thread.find_existing_thread(
            buyer_id=current_buyer_db_id,
            seller_id=seller_id
        )
        
        if existing_thread:
            return existing_thread
        
        thread_input = ChatThreadInputDTO(
            id=uuid4(), # id is still part of ChatThreadInputDTO
            buyer_id=current_buyer_db_id,
            seller_id=seller_id
        )
        
        return await self.daos.chat_thread.create(thread_input)

    async def get_buyer_chats(self, buyer_db_id: UUID) -> list[ChatThreadWithLastMessageDTO]:
        """Get all chat threads for a buyer with last message info."""
        threads_data = await self.daos.chat_thread.get_threads_with_last_message(
            user_id=buyer_db_id, # Changed from buyer_id
            user_type="buyer"
        )
        
        return [ChatThreadWithLastMessageDTO(**thread_data) for thread_data in threads_data]

    async def get_seller_chats(self, seller_db_id: UUID) -> list[ChatThreadWithLastMessageDTO]:
        """Get all chat threads for a seller with last message info."""
        threads_data = await self.daos.chat_thread.get_threads_with_last_message(
            user_id=seller_db_id, # Changed from seller_id
            user_type="seller"
        )
        
        return [ChatThreadWithLastMessageDTO(**thread_data) for thread_data in threads_data]

    async def send_message(self, thread_id: UUID, message_id: UUID, message_text: str, sender: AuthenticatedUser) -> ChatMessage:
        """Send a message in a chat thread."""
        thread = await self.daos.chat_thread.filter_first(id=thread_id)
        if not thread:
            raise ValueError("Chat thread not found")

        buyer_id_for_msg: UUID | None = None
        seller_id_for_msg: UUID | None = None
        is_read_by_buyer_flag = False
        is_read_by_seller_flag = False

        if sender.user_type == "buyer":
            if sender.db_id != thread.buyer_id:
                raise ValueError("Buyer is not a participant of this chat thread")
            buyer_id_for_msg = sender.db_id
            is_read_by_buyer_flag = True
        elif sender.user_type == "seller":
            if sender.db_id != thread.seller_id:
                raise ValueError("Seller is not a participant of this chat thread")
            seller_id_for_msg = sender.db_id
            is_read_by_seller_flag = True
        else:
            raise ValueError("Invalid sender user_type")

        # Create ChatMessage instance directly as ChatMessageInputDTO was modified to remove sender IDs
        new_message = ChatMessage(
            id=message_id, # Client-generated ID
            thread_id=thread_id,
            message=message_text,
            buyer_id=buyer_id_for_msg,
            seller_id=seller_id_for_msg,
            is_read_by_buyer=is_read_by_buyer_flag,
            is_read_by_seller=is_read_by_seller_flag,
            created_at=datetime.now(timezone.utc) # Ensure created_at is set
        )

        # Add to session and commit/flush
        # Assuming DAO has a session attribute and handles commit externally or service does.
        # For now, let's assume DAO methods like `add_and_flush` or similar exist,
        # or we access session directly if DAO structure allows.
        # If DAOs are strictly Pydantic-based, this needs adjustment.
        # Given it's SQLAlchemy, direct session access or a method to add model instance is likely.

        # Simplest assumption: DAO has a way to save a model instance.
        # If not, this part of the code is more complex (e.g. self.daos.chat_message.session.add(...))
        # Let's assume a generic `save` method on the DAO for a model instance.
        # If `BaseDAO` has `session.add`, `session.flush`, `session.refresh`:
        self.daos.chat_message.session.add(new_message)
        await self.daos.chat_message.session.flush()
        await self.daos.chat_message.session.refresh(new_message)
        created_message = new_message # Use this for WebSocket

        # Отправляем WebSocket уведомление (adapted from original)
        try:
            from backend.routes.websocket_routes import notify_new_message
            import asyncio
            import json

            ws_message_data = {
                "type": "message",
                "thread_id": str(created_message.thread_id),
                "sender_id": str(sender.db_id), # Use sender from AuthenticatedUser
                "sender_type": sender.user_type,
                "message": created_message.message,
                "message_id": str(created_message.id),
                "timestamp": created_message.created_at.isoformat() if created_message.created_at else None
            }

            class SimpleWebSocketMessage: # Keep this helper for now
                def model_dump_json(self):
                    return json.dumps(ws_message_data)

            ws_message = SimpleWebSocketMessage()
            asyncio.create_task(notify_new_message(str(created_message.thread_id), ws_message))

        except Exception as e:
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
        user: AuthenticatedUser # Changed user_id, user_type to user
    ) -> None:
        """Mark messages as read for a user."""
        if user.user_type == "buyer":
            await self.daos.chat_message.mark_as_read_by_buyer(thread_id, user.db_id)
        elif user.user_type == "seller":
            await self.daos.chat_message.mark_as_read_by_seller(thread_id, user.db_id)
        else:
            raise ValueError("Invalid user type")

    async def get_unread_count(
        self, 
        user: AuthenticatedUser, # Changed user_id, user_type to user
        thread_id: UUID | None = None
    ) -> int:
        """Get unread message count for a user."""
        if user.user_type == "buyer":
            return await self.daos.chat_message.count_unread_for_buyer(user.db_id, thread_id)
        elif user.user_type == "seller":
            return await self.daos.chat_message.count_unread_for_seller(user.db_id, thread_id)
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
