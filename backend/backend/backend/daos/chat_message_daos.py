from uuid import UUID
from sqlalchemy import desc

from backend.daos.base_daos import BaseDAO
# Added ChatMessageDTO to the import
from backend.dtos.chat_message_dtos import ChatMessageInputDTO, ChatMessageUpdateDTO, ChatMessageDTO
from backend.models.chat_message_models import ChatMessage


class ChatMessageDAO(
    BaseDAO[
        ChatMessage,
        ChatMessageInputDTO,
        ChatMessageUpdateDTO,
        ChatMessageDTO,  # Added ChatMessageDTO here
    ]
):
    """ChatMessage DAO."""

    async def get_by_thread_id(self, thread_id: UUID, limit: int = 50) -> list[ChatMessage]:
        """Get messages for a specific thread, ordered by creation time."""
        # This method returns a list of ChatMessage models, not DTOs.
        # If DTO conversion is needed, it should be handled here or by the caller.
        # BaseDAO.filter returns model instances.
        messages_query = await self.filter(thread_id=thread_id)
        # Ensure messages_query is not None before sorting
        messages = messages_query if messages_query is not None else []

        # Sort by created_at. Assuming created_at is a valid attribute.
        # The existing sort is Python-side. For large datasets, DB-side sorting is better.
        # Example: query = query.order_by(desc(self.model.created_at)) in _apply_base_filter or similar
        sorted_messages = sorted(messages, key=lambda x: x.created_at, reverse=True)
        return sorted_messages[:limit]

    async def mark_as_read_by_buyer(self, thread_id: UUID, buyer_id: UUID) -> None: # buyer_id seems unused in query
        """Mark all messages in thread as read by buyer."""
        # Используем прямой SQL запрос для обновления сообщений от продавца
        from sqlalchemy import text # Keep import local if only used here

        query = text("""
            UPDATE chat_message
            SET is_read_by_buyer = true
            WHERE thread_id = :thread_id
            AND is_read_by_buyer = false
            AND seller_id IS NOT NULL
            AND buyer_id IS NULL -- This condition means the message is from a seller to a buyer (no buyer_id on msg)
                                -- However, the method is called mark_as_read_by_buyer, implying buyer is the actor.
                                -- The original query seems to target messages *sent by sellers*.
                                -- If the intent is to mark messages *received by a specific buyer* as read,
                                -- the logic might need adjustment based on ChatMessage model structure
                                -- (e.g., if messages have a recipient_buyer_id).
                                -- Given the current query, buyer_id parameter is not used.
        """)

        await self.session.execute(query, {"thread_id": thread_id})
        await self.session.commit()

    async def mark_as_read_by_seller(self, thread_id: UUID, seller_id: UUID) -> None: # seller_id seems unused in query
        """Mark all messages in thread as read by seller."""
        # Используем прямой SQL запрос для обновления сообщений от покупателя
        from sqlalchemy import text # Keep import local

        query = text("""
            UPDATE chat_message
            SET is_read_by_seller = true
            WHERE thread_id = :thread_id
            AND is_read_by_seller = false
            AND buyer_id IS NOT NULL
            AND seller_id IS NULL -- This condition means the message is from a buyer to a seller.
                                -- Similar to above, seller_id parameter is not used in the current query.
        """)

        await self.session.execute(query, {"thread_id": thread_id})
        await self.session.commit()

    async def count_unread_for_buyer(self, buyer_id: UUID, thread_id: UUID | None = None) -> int: # buyer_id seems unused
        """Count unread messages for buyer - сообщения от продавца, которые покупатель не прочитал."""
        from sqlalchemy import text

        params = {"buyer_id_param": buyer_id} # Parameterize buyer_id if needed in query

        base_query_conditions = """
            is_read_by_buyer = false
            AND seller_id IS NOT NULL -- Message is from a seller
            AND buyer_id IS NULL      -- Message has no buyer_id (i.e., it's not from this buyer)
        """
        # If messages should be counted for a specific buyer (recipient), the model & query need to reflect that.
        # Current query counts all messages from sellers in a thread/system that this buyer hasn't read.

        if thread_id:
            query_str = f"""
                SELECT COUNT(*) FROM chat_message
                WHERE thread_id = :thread_id
                AND {base_query_conditions}
            """
            params["thread_id"] = thread_id
        else:
            # This global count might be problematic if buyer_id is not used to scope further.
            # It counts all unread messages from any seller to any buyer (system-wide for this buyer's view).
            # If it's "unread by this specific buyer", the query would need a way to link messages to this buyer as recipient.
            # For now, assuming the query reflects the intended (perhaps broad) logic.
            query_str = f"""
                SELECT COUNT(*) FROM chat_message
                WHERE {base_query_conditions}
            """
            # If buyer_id should scope this global query (e.g. messages in threads this buyer is part of):
            # query_str += " AND thread_id IN (SELECT DISTINCT thread_id FROM chat_thread_participants WHERE user_id = :buyer_id_param)"
            # This is an example and depends on having a chat_thread_participants table or similar.

        result = await self.session.execute(text(query_str), params)
        return result.scalar_one_or_none() or 0


    async def count_unread_for_seller(self, seller_id: UUID, thread_id: UUID | None = None) -> int: # seller_id seems unused
        """Count unread messages for seller - сообщения от покупателя, которые продавец не прочитал."""
        from sqlalchemy import text

        params = {"seller_id_param": seller_id} # Parameterize seller_id if needed in query

        base_query_conditions = """
            is_read_by_seller = false
            AND buyer_id IS NOT NULL  -- Message is from a buyer
            AND seller_id IS NULL     -- Message has no seller_id (i.e., it's not from this seller)
        """
        # Similar logic considerations as for count_unread_for_buyer regarding message scoping.

        if thread_id:
            query_str = f"""
                SELECT COUNT(*) FROM chat_message
                WHERE thread_id = :thread_id
                AND {base_query_conditions}
            """
            params["thread_id"] = thread_id
        else:
            query_str = f"""
                SELECT COUNT(*) FROM chat_message
                WHERE {base_query_conditions}
            """
            # Example scoping:
            # query_str += " AND thread_id IN (SELECT DISTINCT thread_id FROM chat_thread_participants WHERE user_id = :seller_id_param)"


        result = await self.session.execute(text(query_str), params)
        return result.scalar_one_or_none() or 0
