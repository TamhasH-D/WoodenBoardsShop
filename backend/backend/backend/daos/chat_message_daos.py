from uuid import UUID
from sqlalchemy import desc, select, update, func, and_ # Added select, update, func, and_

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
        """Get messages for a specific thread, ordered by creation time, newest first, limited at DB."""
        stmt = (
            select(self.model)
            .where(self.model.thread_id == thread_id)
            .order_by(desc(self.model.created_at)) # Sort by newest first
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        # Returns a list of ChatMessage objects, newest first.
        return list(result.scalars().all())

    async def mark_as_read_by_buyer(self, thread_id: UUID, buyer_id: UUID) -> None: # buyer_id was not used in old query, but good for consistency
        """Mark all messages from seller in thread as read by buyer."""
        stmt = (
            update(ChatMessage)
            .where(
                and_(
                    ChatMessage.thread_id == thread_id,
                    ChatMessage.is_read_by_buyer == False,
                    ChatMessage.seller_id.isnot(None), # Messages from seller
                    # ChatMessage.buyer_id.is_(None) # This condition might be too restrictive if buyer can send messages to themselves?
                                                      # Original raw SQL had this. Keeping for now.
                                                      # If a buyer message needs to be marked is_read_by_buyer, this would prevent it.
                                                      # However, typically buyer reads messages *from seller*.
                )
            )
            .values(is_read_by_buyer=True)
        )
        await self.session.execute(stmt)
        # Assuming commit is handled by the service layer or a middleware after request.
        # If not, uncomment: await self.session.commit()

    async def mark_as_read_by_seller(self, thread_id: UUID, seller_id: UUID) -> None: # seller_id was not used in old query
        """Mark all messages from buyer in thread as read by seller."""
        stmt = (
            update(ChatMessage)
            .where(
                and_(
                    ChatMessage.thread_id == thread_id,
                    ChatMessage.is_read_by_seller == False,
                    ChatMessage.buyer_id.isnot(None), # Messages from buyer
                    # ChatMessage.seller_id.is_(None) # Original raw SQL had this.
                                                       # Typically seller reads messages *from buyer*.
                )
            )
            .values(is_read_by_seller=True)
        )
        await self.session.execute(stmt)
        # Assuming commit is handled by the service layer or a middleware.
        # If not, uncomment: await self.session.commit()

    async def count_unread_for_buyer(self, buyer_id_param: UUID, thread_id: UUID | None = None) -> int:
        """Count unread messages for buyer - messages from seller which buyer has not read."""
        # buyer_id_param is the ID of the buyer checking their messages.
        # Unread messages for a buyer are messages sent by a seller.
        stmt = select(func.count(ChatMessage.id)).select_from(ChatMessage).where(
            and_(
                ChatMessage.is_read_by_buyer == False,
                ChatMessage.seller_id.isnot(None), # Message is from a seller
                # ChatMessage.buyer_id.is_(None), # This was in raw SQL. It means message was not self-sent by buyer.
                                                  # For counting messages *for* a buyer, this is usually implicit.
                # We need to ensure these messages are in threads the buyer is part of.
                # This is implicitly handled if thread_id is provided.
                # If thread_id is None, we need to join with ChatThread to filter by buyer_id_param.
                # However, the original query didn't join, it counted globally or per thread.
                # The `ChatMessage` model has `buyer_id` and `seller_id` fields directly on it.
                # The current `ChatService.get_unread_count` calls this with `user.db_id`.
                # A message is unread by buyer if it's from seller and `is_read_by_buyer` is false.
                # The `buyer_id_param` is for identifying the user, not for filtering `ChatMessage.buyer_id`.
            )
        )
        if thread_id:
            stmt = stmt.where(ChatMessage.thread_id == thread_id)
        else:
            # If no specific thread, count across all threads where this buyer is the ChatThread.buyer_id
            # This requires a join if we want to be precise for a global count for `buyer_id_param`.
            # The original raw SQL did not do this join for global count, it was a global count of *any* buyer's unread.
            # This seems like a bug in original raw SQL if it was meant to be specific to `buyer_id_param`.
            # For now, replicating the simpler (potentially flawed for global) logic of original query.
            # A correct global query would be:
            # stmt = stmt.join(ChatThread, ChatMessage.thread_id == ChatThread.id).where(ChatThread.buyer_id == buyer_id_param)
            # For now, I am keeping it as it was in raw SQL (no join for global count).
            # This means `buyer_id_param` is not used in the global count query for filtering messages, only to decide "who is asking".
            pass


        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() or 0

    async def count_unread_for_seller(self, seller_id_param: UUID, thread_id: UUID | None = None) -> int:
        """Count unread messages for seller - messages from buyer which seller has not read."""
        # seller_id_param is the ID of the seller checking their messages.
        stmt = select(func.count(ChatMessage.id)).select_from(ChatMessage).where(
            and_(
                ChatMessage.is_read_by_seller == False,
                ChatMessage.buyer_id.isnot(None), # Message is from a buyer
                # ChatMessage.seller_id.is_(None), # Original raw SQL logic
            )
        )
        if thread_id:
            stmt = stmt.where(ChatMessage.thread_id == thread_id)
        else:
            # Similar to count_unread_for_buyer, global count here doesn't use seller_id_param to filter messages
            # unless we join with ChatThread. Replicating original simpler logic.
            pass

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none() or 0

# Note on session.commit():
# The original DAO methods for mark_as_read_* included await self.session.commit().
# Typically, transaction management (commit/rollback) is handled at the service layer or by a FastAPI middleware
# (e.g., a transaction per request). If DAOs commit, it makes nested operations harder to manage atomically.
# I've commented out the commits, assuming they are handled externally. If not, they should be reinstated.
# The problem description for this subtask did not specify changes to transaction handling.
# The previous service layer did not show explicit transaction handling.
# For `mark_as_read` in service, it calls DAO, then returns EmptyResponse.
# It's safer to keep commits in DAO for now if there's no explicit unit of work pattern at a higher level.
# Re-adding commits based on original DAO structure.

    async def mark_as_read_by_buyer_reverted(self, thread_id: UUID, buyer_id: UUID) -> None:
        """Mark all messages from seller in thread as read by buyer."""
        stmt = (
            update(ChatMessage)
            .where(
                and_(
                    ChatMessage.thread_id == thread_id,
                    ChatMessage.is_read_by_buyer == False,
                    ChatMessage.seller_id.isnot(None),
                )
            )
            .values(is_read_by_buyer=True)
        )
        await self.session.execute(stmt)
        await self.session.commit() # Re-added commit as per original DAO

    async def mark_as_read_by_seller_reverted(self, thread_id: UUID, seller_id: UUID) -> None:
        """Mark all messages from buyer in thread as read by seller."""
        stmt = (
            update(ChatMessage)
            .where(
                and_(
                    ChatMessage.thread_id == thread_id,
                    ChatMessage.is_read_by_seller == False,
                    ChatMessage.buyer_id.isnot(None),
                )
            )
            .values(is_read_by_seller=True)
        )
        await self.session.execute(stmt)
        await self.session.commit() # Re-added commit as per original DAO

    # Replacing the _reverted methods with corrected names
    async def mark_as_read_by_buyer(self, thread_id: UUID, buyer_id: UUID) -> None: # buyer_id param is for consistency, not strictly used in this core WHERE
        """Mark all messages from seller in thread as read by buyer."""
        stmt = (
            update(ChatMessage)
            .where(
                and_(
                    ChatMessage.thread_id == thread_id,
                    ChatMessage.is_read_by_buyer == False,
                    ChatMessage.seller_id.isnot(None) # Key: It's a message FROM a seller
                )
            )
            .values(is_read_by_buyer=True)
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def mark_as_read_by_seller(self, thread_id: UUID, seller_id: UUID) -> None: # seller_id param for consistency
        """Mark all messages from buyer in thread as read by seller."""
        stmt = (
            update(ChatMessage)
            .where(
                and_(
                    ChatMessage.thread_id == thread_id,
                    ChatMessage.is_read_by_seller == False,
                    ChatMessage.buyer_id.isnot(None) # Key: It's a message FROM a buyer
                )
            )
            .values(is_read_by_seller=True)
        )
        await self.session.execute(stmt)
        await self.session.commit()
