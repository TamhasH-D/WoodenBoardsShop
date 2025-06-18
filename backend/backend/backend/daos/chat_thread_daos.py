from uuid import UUID
from sqlalchemy import desc, func, and_, or_, case, literal_column, text, Select
from sqlalchemy.orm import aliased
from sqlalchemy.sql import select, column

from backend.daos.base_daos import BaseDAO
from backend.dtos.chat_thread_dtos import ChatThreadInputDTO, ChatThreadUpdateDTO
from backend.models.chat_thread_models import ChatThread
from backend.models.chat_message_models import ChatMessage
# Removed: from backend.models.user_models import User

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
        """
        Get threads with last message info for a user, sorted by last message time,
        using optimized SQLAlchemy queries. Returns other_user_id instead of name.
        """

        last_message_subquery = (
            select(
                ChatMessage.thread_id,
                func.max(ChatMessage.created_at).label("max_created_at")
            )
            .group_by(ChatMessage.thread_id)
            .subquery("last_message_created_at")
        )

        last_message_content_subquery = (
            select(
                ChatMessage.thread_id,
                ChatMessage.message,
                ChatMessage.created_at
            )
            .join(
                last_message_subquery,
                and_(
                    ChatMessage.thread_id == last_message_subquery.c.thread_id,
                    ChatMessage.created_at == last_message_subquery.c.max_created_at
                )
            )
            .distinct(ChatMessage.thread_id)
            .subquery("last_message_content")
        )

        other_user_id_selectable: literal_column = literal_column("") # Placeholder, will be defined
        if user_type == "buyer":
            unread_condition = and_(
                ChatMessage.thread_id == ChatThread.id,
                ChatMessage.seller_id.isnot(None),
                ChatMessage.is_read_by_buyer == False
            )
            other_user_id_selectable = ChatThread.seller_id.label("other_user_id")
        else: # user_type == "seller"
            unread_condition = and_(
                ChatMessage.thread_id == ChatThread.id,
                ChatMessage.buyer_id.isnot(None),
                ChatMessage.is_read_by_seller == False
            )
            other_user_id_selectable = ChatThread.buyer_id.label("other_user_id")

        unread_count_subquery = (
            select(func.count(ChatMessage.id).label("unread_count"))
            .where(unread_condition)
            .correlate(ChatThread)
            .scalar_subquery()
        )

        # Main query
        query = (
            select(
                ChatThread.id,
                ChatThread.created_at.label("thread_created_at"),
                ChatThread.buyer_id,
                ChatThread.seller_id,
                other_user_id_selectable, # Select the other user's ID directly
                last_message_content_subquery.c.message.label("last_message"),
                last_message_content_subquery.c.created_at.label("last_message_time"),
                unread_count_subquery.label("unread_count")
            )
            .outerjoin( # Use outerjoin in case a thread has no messages yet
                last_message_content_subquery,
                ChatThread.id == last_message_content_subquery.c.thread_id
            )
            # No join to User model needed anymore
        )

        if user_type == "buyer":
            query = query.where(ChatThread.buyer_id == user_id)
        else: # user_type == "seller"
            query = query.where(ChatThread.seller_id == user_id)

        query = query.order_by(
            desc(unread_count_subquery > 0),
            desc(
                func.coalesce(
                    last_message_content_subquery.c.created_at,
                    ChatThread.created_at
                )
            )
        )

        result = await self.session.execute(query)
        threads_data_orm = result.mappings().all()

        threads_data = []
        for row in threads_data_orm:
            thread_dict = dict(row)
            thread_dict["unread_count"] = int(thread_dict.get("unread_count", 0) or 0)
            # other_user_id is already in thread_dict due to direct selection with label
            threads_data.append(thread_dict)

        return threads_data
