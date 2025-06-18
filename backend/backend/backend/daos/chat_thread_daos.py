from uuid import UUID
from sqlalchemy import desc, func, and_, or_, case
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import select

from backend.daos.base_daos import BaseDAO
# Added ChatThreadDTO to the import
from backend.dtos.chat_thread_dtos import ChatThreadInputDTO, ChatThreadUpdateDTO, ChatThreadDTO
from backend.models.chat_thread_models import ChatThread
from backend.models.chat_message_models import ChatMessage # Keep this for get_threads_with_last_message


class ChatThreadDAO(
    BaseDAO[
        ChatThread,
        ChatThreadInputDTO,
        ChatThreadUpdateDTO,
        ChatThreadDTO,  # Added ChatThreadDTO here
    ]
):
    """ChatThread DAO."""

    async def get_by_buyer_id(self, buyer_id: UUID) -> list[ChatThread]:
        """Get all chat threads for a buyer."""
        # BaseDAO.filter returns list[Model] or None.
        # This method's type hint is list[ChatThread], so we handle None.
        result = await self.filter(buyer_id=buyer_id)
        return result if result is not None else []

    async def get_by_seller_id(self, seller_id: UUID) -> list[ChatThread]:
        """Get all chat threads for a seller."""
        result = await self.filter(seller_id=seller_id)
        return result if result is not None else []

    async def find_existing_thread(self, buyer_id: UUID, seller_id: UUID) -> ChatThread | None:
        """Find existing thread between buyer and seller."""
        return await self.filter_first(buyer_id=buyer_id, seller_id=seller_id)

    async def get_threads_with_last_message(self, user_id: UUID, user_type: str) -> list[dict]:
        """Get threads with last message info for a user, sorted by last message time."""

        # This method has custom logic and returns a list of dicts, not DTOs.
        # It's okay for it to remain as is, not directly using the OutDTO from BaseDAO generics
        # unless it were to be refactored to return List[SomeSpecificThreadInfoDTO].

        threads_query_result: list[ChatThread] | None
        if user_type == "buyer":
            threads_query_result = await self.filter(buyer_id=user_id)
        else:
            threads_query_result = await self.filter(seller_id=user_id)

        threads: list[ChatThread] = threads_query_result if threads_query_result is not None else []


        threads_data = []
        for thread in threads:
            messages_result = await self.session.execute(
                select(ChatMessage)
                .where(ChatMessage.thread_id == thread.id)
                .order_by(desc(ChatMessage.created_at))
                .limit(1)
            )
            last_message = messages_result.scalar_one_or_none()

            unread_count_val: int
            if user_type == "buyer":
                unread_query = select(func.count(ChatMessage.id)).where(
                    and_(
                        ChatMessage.thread_id == thread.id,
                        ChatMessage.seller_id.isnot(None),
                        ChatMessage.buyer_id.is_(None),
                        ChatMessage.is_read_by_buyer == False
                    )
                )
            else:
                unread_query = select(func.count(ChatMessage.id)).where(
                    and_(
                        ChatMessage.thread_id == thread.id,
                        ChatMessage.buyer_id.isnot(None),
                        ChatMessage.seller_id.is_(None),
                        ChatMessage.is_read_by_seller == False
                    )
                )

            unread_result = await self.session.execute(unread_query)
            unread_count_val = unread_result.scalar_one_or_none() or 0 # Ensure scalar_one_or_none then default

            threads_data.append({
                "id": thread.id,
                "created_at": thread.created_at, # Assuming ChatThread has created_at
                "buyer_id": thread.buyer_id,
                "seller_id": thread.seller_id,
                "last_message": last_message.message if last_message else None,
                "last_message_time": last_message.created_at if last_message else None,
                "unread_count": unread_count_val # Already int from scalar_one_or_none or 0
            })

        # Ensure robust sorting, especially if last_message_time can be None
        def sort_key_func(x):
            # Primary sort: unread messages on top (True = 1, False = 0, so -1 for True to be first)
            primary_sort = -(x["unread_count"] > 0)

            # Secondary sort: by last message time (most recent first)
            # If last_message_time is None, use thread's creation time as a fallback
            time_to_sort = x["last_message_time"] or x["created_at"]
            # Ensure time_to_sort is a datetime object with a timestamp method
            secondary_sort = -time_to_sort.timestamp() if time_to_sort else 0
            return (primary_sort, secondary_sort)

        threads_data.sort(key=sort_key_func)

        return threads_data
