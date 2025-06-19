from uuid import UUID
from sqlalchemy import desc, func, and_, or_, case, literal_column, text, ColumnElement
from sqlalchemy.orm import aliased
from sqlalchemy.sql import select, Subquery

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
        """
        Get threads with last message info for a user, sorted by unread status
        and then by last message time, using a single optimized SQL query.
        """

        # 1. Subquery for the last message in each thread
        last_msg_sq = (
            select(
                ChatMessage.thread_id.label("l_thread_id"),
                ChatMessage.message.label("last_message_text"),
                ChatMessage.created_at.label("last_message_ts"),
                func.row_number().over(
                    partition_by=ChatMessage.thread_id,
                    order_by=desc(ChatMessage.created_at)
                ).label("rn")
            )
            .select_from(ChatMessage)
            .alias("last_msg_sq") # Use alias for subquery naming
        )
        # last_msg_sq is now an aliased construct, not a Subquery object for .c access
        # we need to refer to its columns via last_msg_sq.c.column_name

        # 2. Subquery for unread message count (conditional on user_type)
        unread_filter_condition: ColumnElement[bool]
        if user_type == "buyer":
            unread_filter_condition = and_(
                ChatMessage.thread_id == ChatThread.id, # Correlated subquery
                ChatMessage.seller_id.isnot(None),
                ChatMessage.is_read_by_buyer == False
            )
        elif user_type == "seller":
            unread_filter_condition = and_(
                ChatMessage.thread_id == ChatThread.id, # Correlated subquery
                ChatMessage.buyer_id.isnot(None),
                ChatMessage.is_read_by_seller == False
            )
        else:
            raise ValueError("Invalid user_type specified.")

        unread_count_sq = (
            select(func.count(ChatMessage.id))
            .where(unread_filter_condition)
            .label("unread_c") # Apply label for scalar subquery
        )

        # 3. Main query
        stmt = (
            select(
                ChatThread.id,
                ChatThread.created_at.label("thread_created_at"),
                ChatThread.buyer_id,
                ChatThread.seller_id,
                last_msg_sq.c.last_message_text,
                last_msg_sq.c.last_message_ts,
                unread_count_sq.as_scalar().label("unread_count") # Use as_scalar() for scalar subquery
            )
            .select_from(ChatThread) # Explicit select_from
            .outerjoin( # Use outer join in case a thread has no messages
                last_msg_sq,
                and_(
                    ChatThread.id == last_msg_sq.c.l_thread_id,
                    last_msg_sq.c.rn == 1
                )
            )
        )

        # 4. Filter by user_id based on user_type
        if user_type == "buyer":
            stmt = stmt.where(ChatThread.buyer_id == user_id)
        else: # user_type == "seller"
            stmt = stmt.where(ChatThread.seller_id == user_id)

        # 5. Ordering:
        # - Threads with unread_count > 0 first (boolean check, DESC makes TRUE first)
        # - Then by last_message_ts (descending, NULLS LAST to keep threads with no messages at the end of their group)
        # - Finally by thread's own created_at if last_message_ts is also NULL
        stmt = stmt.order_by(
            desc(literal_column("unread_count") > 0), # Order by boolean expression
            desc(last_msg_sq.c.last_message_ts).nullslast(),
            desc(ChatThread.created_at)
        )

        result = await self.session.execute(stmt)

        # 6. Transform results into list of dictionaries
        threads_data = []
        for row in result.mappings().all(): # Use mappings() for dict-like rows
            threads_data.append({
                "id": row["id"],
                "created_at": row["thread_created_at"],
                "buyer_id": row["buyer_id"],
                "seller_id": row["seller_id"],
                "last_message": row["last_message_text"],
                "last_message_time": row["last_message_ts"],
                "unread_count": row["unread_count"] if row["unread_count"] is not None else 0,
            })

        return threads_data
