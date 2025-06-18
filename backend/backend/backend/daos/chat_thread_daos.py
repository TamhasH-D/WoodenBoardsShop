from uuid import UUID
from sqlalchemy import desc, func, and_, or_, case, literal_column, text, Select
from sqlalchemy.orm import aliased
from sqlalchemy.sql import select, column

from backend.daos.base_daos import BaseDAO
from backend.dtos.chat_thread_dtos import ChatThreadInputDTO, ChatThreadUpdateDTO
from backend.models.chat_thread_models import ChatThread
from backend.models.chat_message_models import ChatMessage
from backend.models.user_models import User # Assuming User model for buyer/seller names

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
        using optimized SQLAlchemy queries.
        """

        # Alias for ChatMessage to distinguish in subquery if needed, though not strictly necessary here
        # cm_alias = aliased(ChatMessage)

        # Subquery to get the last message ID for each thread
        last_message_subquery = (
            select(
                ChatMessage.thread_id,
                func.max(ChatMessage.created_at).label("max_created_at")
            )
            .group_by(ChatMessage.thread_id)
            .subquery("last_message_created_at")
        )

        # Subquery to get the actual last message content using the result from above
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
            # Handle cases where multiple messages might have the exact same max_created_at
            # by picking one (e.g., by id, though not strictly necessary if timestamps are precise enough)
            .distinct(ChatMessage.thread_id) # Ensures one row per thread
            .subquery("last_message_content")
        )

        # Subquery for unread messages count
        if user_type == "buyer":
            unread_condition = and_(
                ChatMessage.thread_id == ChatThread.id, # Correlated subquery
                ChatMessage.seller_id.isnot(None),
                ChatMessage.is_read_by_buyer == False
            )
            # For buyer, the other party in chat is the seller
            other_user_id_column = ChatThread.seller_id
        else: # user_type == "seller"
            unread_condition = and_(
                ChatMessage.thread_id == ChatThread.id, # Correlated subquery
                ChatMessage.buyer_id.isnot(None),
                ChatMessage.is_read_by_seller == False
            )
            # For seller, the other party in chat is the buyer
            other_user_id_column = ChatThread.buyer_id

        unread_count_subquery = (
            select(func.count(ChatMessage.id).label("unread_count"))
            .where(unread_condition)
            .correlate(ChatThread) # Important for correlated subquery
            .scalar_subquery() # Makes it usable as a column
        )

        # Alias for the User model to join for the other user's name
        OtherUser = aliased(User, name="other_user")

        # Main query
        query = (
            select(
                ChatThread.id,
                ChatThread.created_at.label("thread_created_at"),
                ChatThread.buyer_id,
                ChatThread.seller_id,
                OtherUser.first_name.label("other_user_first_name"), # Get other user's first name
                OtherUser.last_name.label("other_user_last_name"),   # Get other user's last name
                last_message_content_subquery.c.message.label("last_message"),
                last_message_content_subquery.c.created_at.label("last_message_time"),
                unread_count_subquery.label("unread_count")
            )
            .outerjoin(
                last_message_content_subquery,
                ChatThread.id == last_message_content_subquery.c.thread_id
            )
            .join(
                OtherUser, # Join with User table for the other party's name
                other_user_id_column == OtherUser.id
            )
        )

        if user_type == "buyer":
            query = query.where(ChatThread.buyer_id == user_id)
        else: # user_type == "seller"
            query = query.where(ChatThread.seller_id == user_id)

        # Sorting: threads with unread messages first, then by last message time (descending)
        # If no last message, sort by thread creation time (descending)
        query = query.order_by(
            desc(unread_count_subquery > 0), # True (1) before False (0)
            desc(
                func.coalesce(
                    last_message_content_subquery.c.created_at,
                    ChatThread.created_at # Fallback to thread creation time if no messages
                )
            )
        )

        # print("\nSQL Query for get_threads_with_last_message:\n", query.compile(compile_kwargs={"literal_binds": True}))

        result = await self.session.execute(query)
        threads_data_orm = result.mappings().all() # Returns list of dict-like RowMapping objects

        # Convert RowMapping objects to dictionaries
        threads_data = [dict(row) for row in threads_data_orm]

        # Ensure unread_count is an int
        for thread_dict in threads_data:
            thread_dict["unread_count"] = int(thread_dict.get("unread_count", 0) or 0)
            # Combine first and last name for a display name
            first_name = thread_dict.pop("other_user_first_name", "")
            last_name = thread_dict.pop("other_user_last_name", "")
            thread_dict["other_user_name"] = f"{first_name} {last_name}".strip()
            if not thread_dict["other_user_name"]: # Fallback if name is empty
                 thread_dict["other_user_name"] = "Пользователь"


        return threads_data

    # Example of how you might get a User model, if needed elsewhere
    # async def get_user_by_id(self, user_id: UUID) -> User | None:
    #     return await self.session.get(User, user_id)

# Note: The User model (backend.models.user_models.User) is assumed to have
# 'id', 'first_name', and 'last_name' fields for the 'other_user_name' functionality.
# If the User model is different or not available at this path, adjust the import and usage.
# The DAO for User would typically handle fetching User details if more complex logic is needed.
# This implementation directly joins for simplicity as requested by the optimization.
# Ensure the User model is correctly imported and mapped in your SQLAlchemy setup.
# If User model is not available or desired, remove the join to OtherUser and the other_user_name logic.
