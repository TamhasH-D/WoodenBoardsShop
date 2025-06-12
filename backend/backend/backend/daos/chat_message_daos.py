from uuid import UUID
from sqlalchemy import desc

from backend.daos.base_daos import BaseDAO
from backend.dtos.chat_message_dtos import ChatMessageInputDTO, ChatMessageUpdateDTO
from backend.models.chat_message_models import ChatMessage


class ChatMessageDAO(
    BaseDAO[
        ChatMessage,
        ChatMessageInputDTO,
        ChatMessageUpdateDTO,
    ]
):
    """ChatMessage DAO."""

    async def get_by_thread_id(self, thread_id: UUID, limit: int = 50) -> list[ChatMessage]:
        """Get messages for a specific thread, ordered by creation time."""
        # Используем базовый метод filter с дополнительными параметрами
        messages = await self.filter(thread_id=thread_id)
        # Сортируем по времени создания (новые сначала) и ограничиваем количество
        sorted_messages = sorted(messages, key=lambda x: x.created_at, reverse=True)
        return sorted_messages[:limit]

    async def mark_as_read_by_buyer(self, thread_id: UUID, buyer_id: UUID) -> None:
        """Mark all messages in thread as read by buyer."""
        # Получаем сообщения для обновления
        messages = await self.filter(
            thread_id=thread_id,
            buyer_id=buyer_id,
            is_read_by_buyer=False
        )

        # Обновляем каждое сообщение
        for message in messages:
            update_dto = ChatMessageUpdateDTO(is_read_by_buyer=True)
            await self.update(message.id, update_dto)

    async def mark_as_read_by_seller(self, thread_id: UUID, seller_id: UUID) -> None:
        """Mark all messages in thread as read by seller."""
        # Получаем сообщения для обновления
        messages = await self.filter(
            thread_id=thread_id,
            seller_id=seller_id,
            is_read_by_seller=False
        )

        # Обновляем каждое сообщение
        for message in messages:
            update_dto = ChatMessageUpdateDTO(is_read_by_seller=True)
            await self.update(message.id, update_dto)

    async def count_unread_for_buyer(self, buyer_id: UUID, thread_id: UUID | None = None) -> int:
        """Count unread messages for buyer."""
        filter_params = {
            "buyer_id": buyer_id,
            "is_read_by_buyer": False
        }
        if thread_id:
            filter_params["thread_id"] = thread_id

        messages = await self.filter(**filter_params)
        return len(messages)

    async def count_unread_for_seller(self, seller_id: UUID, thread_id: UUID | None = None) -> int:
        """Count unread messages for seller."""
        filter_params = {
            "seller_id": seller_id,
            "is_read_by_seller": False
        }
        if thread_id:
            filter_params["thread_id"] = thread_id

        messages = await self.filter(**filter_params)
        return len(messages)
