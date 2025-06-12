from uuid import UUID
from sqlalchemy import desc, func
from sqlalchemy.orm import joinedload

from backend.daos.base_daos import BaseDAO
from backend.dtos.chat_thread_dtos import ChatThreadInputDTO, ChatThreadUpdateDTO
from backend.models.chat_thread_models import ChatThread
from backend.models.chat_message_models import ChatMessage


class ChatThreadDAO(
    BaseDAO[
        ChatThread,
        ChatThreadInputDTO,
        ChatThreadUpdateDTO,
    ]
):
    """ChatThread DAO."""

    async def get_by_buyer_id(self, buyer_id: UUID) -> list[ChatThread]:
        """Get all chat threads for a buyer."""
        return await self.filter(buyer_id=buyer_id)

    async def get_by_seller_id(self, seller_id: UUID) -> list[ChatThread]:
        """Get all chat threads for a seller."""
        return await self.filter(seller_id=seller_id)

    async def find_existing_thread(self, buyer_id: UUID, seller_id: UUID) -> ChatThread | None:
        """Find existing thread between buyer and seller."""
        return await self.filter_first(buyer_id=buyer_id, seller_id=seller_id)

    async def get_threads_with_last_message(self, user_id: UUID, user_type: str) -> list[dict]:
        """Get threads with last message info for a user."""
        # Простая реализация - получаем треды пользователя
        if user_type == "buyer":
            threads = await self.filter(buyer_id=user_id)
        else:
            threads = await self.filter(seller_id=user_id)

        # Формируем результат с базовой информацией
        threads_data = []
        for thread in threads:
            threads_data.append({
                "id": thread.id,
                "created_at": thread.created_at,
                "buyer_id": thread.buyer_id,
                "seller_id": thread.seller_id,
                "last_message": None,  # TODO: Implement last message logic
                "last_message_time": None,
                "unread_count": 0  # TODO: Implement unread count logic
            })

        return threads_data
