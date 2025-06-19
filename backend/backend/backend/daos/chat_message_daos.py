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
        # Используем прямой SQL запрос для обновления сообщений от продавца
        from sqlalchemy import text

        query = text("""
            UPDATE chat_message
            SET is_read_by_buyer = true
            WHERE thread_id = :thread_id
            AND is_read_by_buyer = false
            AND seller_id IS NOT NULL
            AND buyer_id IS NULL
        """)

        await self.session.execute(query, {"thread_id": thread_id})
        await self.session.commit()

    async def mark_as_read_by_seller(self, thread_id: UUID, seller_id: UUID) -> None:
        """Mark all messages in thread as read by seller."""
        # Используем прямой SQL запрос для обновления сообщений от покупателя
        from sqlalchemy import text

        query = text("""
            UPDATE chat_message
            SET is_read_by_seller = true
            WHERE thread_id = :thread_id
            AND is_read_by_seller = false
            AND buyer_id IS NOT NULL
            AND seller_id IS NULL
        """)

        await self.session.execute(query, {"thread_id": thread_id})
        await self.session.commit()

    async def count_unread_for_buyer(self, buyer_id: UUID, thread_id: UUID | None = None) -> int:
        """Count unread messages for buyer - сообщения от продавца, которые покупатель не прочитал."""
        from sqlalchemy import text

        if thread_id:
            query = text("""
                SELECT COUNT(*) FROM chat_message
                WHERE thread_id = :thread_id
                AND is_read_by_buyer = false
                AND seller_id IS NOT NULL
                AND buyer_id IS NULL
            """)
            result = await self.session.execute(query, {"thread_id": thread_id})
        else:
            query = text("""
                SELECT COUNT(*) FROM chat_message
                WHERE is_read_by_buyer = false
                AND seller_id IS NOT NULL
                AND buyer_id IS NULL
            """)
            result = await self.session.execute(query)

        return result.scalar() or 0

    async def count_unread_for_seller(self, seller_id: UUID, thread_id: UUID | None = None) -> int:
        """Count unread messages for seller - сообщения от покупателя, которые продавец не прочитал."""
        from sqlalchemy import text

        if thread_id:
            query = text("""
                SELECT COUNT(*) FROM chat_message
                WHERE thread_id = :thread_id
                AND is_read_by_seller = false
                AND buyer_id IS NOT NULL
                AND seller_id IS NULL
            """)
            result = await self.session.execute(query, {"thread_id": thread_id})
        else:
            query = text("""
                SELECT COUNT(*) FROM chat_message
                WHERE is_read_by_seller = false
                AND buyer_id IS NOT NULL
                AND seller_id IS NULL
            """)
            result = await self.session.execute(query)

        return result.scalar() or 0
