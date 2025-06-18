from uuid import UUID
from sqlalchemy import desc, func, and_, or_, case
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import select

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
        """Get threads with last message info for a user, sorted by last message time."""

        # Простая реализация для начала - получаем треды пользователя
        if user_type == "buyer":
            threads = await self.filter(buyer_id=user_id)
        else:
            threads = await self.filter(seller_id=user_id)

        threads_data = []
        for thread in threads:
            # Получаем последнее сообщение для треда
            messages = await self.session.execute(
                select(ChatMessage)
                .where(ChatMessage.thread_id == thread.id)
                .order_by(desc(ChatMessage.created_at))
                .limit(1)
            )
            last_message = messages.scalar_one_or_none()

            # Подсчитываем непрочитанные сообщения
            if user_type == "buyer":
                # Покупатель видит непрочитанные сообщения от продавца
                unread_query = select(func.count(ChatMessage.id)).where(
                    and_(
                        ChatMessage.thread_id == thread.id,
                        ChatMessage.seller_id.isnot(None),  # сообщения от продавца
                        ChatMessage.buyer_id.is_(None),     # buyer_id = NULL
                        ChatMessage.is_read_by_buyer == False
                    )
                )
            else:
                # Продавец видит непрочитанные сообщения от покупателя
                unread_query = select(func.count(ChatMessage.id)).where(
                    and_(
                        ChatMessage.thread_id == thread.id,
                        ChatMessage.buyer_id.isnot(None),   # сообщения от покупателя
                        ChatMessage.seller_id.is_(None),    # seller_id = NULL
                        ChatMessage.is_read_by_seller == False
                    )
                )

            unread_result = await self.session.execute(unread_query)
            unread_count = unread_result.scalar() or 0

            threads_data.append({
                "id": thread.id,
                "created_at": thread.created_at,
                "buyer_id": thread.buyer_id,
                "seller_id": thread.seller_id,
                "last_message": last_message.message if last_message else None,
                "last_message_time": last_message.created_at if last_message else None,
                "unread_count": int(unread_count)
            })

        # Сортируем: сначала с непрочитанными, затем по времени последнего сообщения
        threads_data.sort(
            key=lambda x: (
                -(x["unread_count"] > 0),  # Непрочитанные сверху
                -(x["last_message_time"] or x["created_at"]).timestamp()  # Новые сверху
            )
        )

        return threads_data
