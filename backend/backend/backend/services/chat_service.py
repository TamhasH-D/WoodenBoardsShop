from uuid import UUID, uuid4
from datetime import datetime, timezone

from backend.daos import AllDAOs
from backend.dtos.chat_message_dtos import (
    ChatMessageInputDTO,
    StartChatDTO,
    # WebSocketMessageDTO is now primarily used by websocket_routes
    # We might still need it for constructing messages to send
    WebSocketMessageDTO,
)
from backend.dtos.chat_thread_dtos import (
    ChatThreadInputDTO,
    ChatThreadWithLastMessageDTO,
)
from backend.models.chat_thread_models import ChatThread
from backend.models.chat_message_models import ChatMessage

# Functions for WebSocket communication
from backend.routes.websocket_routes import (
    notify_new_chat_message_via_ws,
    send_global_seller_notification
)
import asyncio # Required for create_task
import logging # For logging errors during WebSocket calls

logger = logging.getLogger(__name__)

class ChatService:
    """Service for chat business logic."""

    def __init__(self, daos: AllDAOs):
        self.daos = daos

    async def start_chat_with_seller(self, start_chat_dto: StartChatDTO) -> ChatThread:
        """Start a new chat thread between buyer and seller."""
        # Проверяем, существует ли уже тред между этими пользователями
        existing_thread = await self.daos.chat_thread.find_existing_thread(
            buyer_id=start_chat_dto.buyer_id,
            seller_id=start_chat_dto.seller_id
        )
        
        if existing_thread:
            return existing_thread
        
        # Создаем новый тред
        thread_input = ChatThreadInputDTO(
            id=uuid4(),
            buyer_id=start_chat_dto.buyer_id,
            seller_id=start_chat_dto.seller_id
        )
        
        created_thread = await self.daos.chat_thread.create(thread_input)

        # Notify seller about the new chat thread
        try:
            notification_payload = {
                "type": "new_chat_thread",
                "thread_id": str(created_thread.id),
                "buyer_id": str(created_thread.buyer_id),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            asyncio.create_task(send_global_seller_notification(
                seller_id=str(created_thread.seller_id),
                notification_data=notification_payload
            ))
            logger.info(f"Global notification task created for new thread {created_thread.id} for seller {created_thread.seller_id}")
        except Exception as e:
            logger.error(f"Failed to send global new_chat_thread notification for seller {created_thread.seller_id}: {e}")

        return created_thread

    async def get_buyer_chats(self, buyer_id: UUID) -> list[ChatThreadWithLastMessageDTO]:
        """Get all chat threads for a buyer with last message info."""
        threads_data = await self.daos.chat_thread.get_threads_with_last_message(
            user_id=buyer_id,
            user_type="buyer"
        )
        
        return [ChatThreadWithLastMessageDTO(**thread_data) for thread_data in threads_data]

    async def get_seller_chats(self, seller_id: UUID) -> list[ChatThreadWithLastMessageDTO]:
        """Get all chat threads for a seller with last message info."""
        threads_data = await self.daos.chat_thread.get_threads_with_last_message(
            user_id=seller_id,
            user_type="seller"
        )
        
        return [ChatThreadWithLastMessageDTO(**thread_data) for thread_data in threads_data]

    async def send_message(self, message_input: ChatMessageInputDTO) -> ChatMessage:
        """Send a message in a chat thread."""
        # Проверяем, что тред существует
        thread = await self.daos.chat_thread.filter_first(id=message_input.thread_id)
        if not thread:
            raise ValueError("Chat thread not found")

        # Проверяем, что указан только один отправитель (buyer_id ИЛИ seller_id, но не оба)
        if (message_input.buyer_id is not None and message_input.seller_id is not None):
            raise ValueError("Message can have only one sender (buyer_id OR seller_id)")

        if (message_input.buyer_id is None and message_input.seller_id is None):
            raise ValueError("Message must have a sender (buyer_id OR seller_id)")

        # Проверяем, что отправитель является участником треда
        if message_input.buyer_id is not None:
            if message_input.buyer_id != thread.buyer_id:
                raise ValueError("Buyer is not a participant of this chat thread")

        if message_input.seller_id is not None:
            if message_input.seller_id != thread.seller_id:
                raise ValueError("Seller is not a participant of this chat thread")

        # Создаем сообщение в базе данных
        created_message = await self.daos.chat_message.create(message_input)

        # Отправляем WebSocket уведомление через новую функцию
        try:
            sender_id = message_input.buyer_id if message_input.buyer_id else message_input.seller_id
            sender_type = "buyer" if message_input.buyer_id else "seller"

            # Убедимся, что sender_id не None перед использованием
            if sender_id is None:
                # Это не должно произойти из-за проверок выше, но для безопасности
                logger.error("Sender ID is None before creating WebSocket message DTO.")
                # Можно либо вернуть ошибку, либо не отправлять WebSocket сообщение
                return created_message


            ws_message_dto = WebSocketMessageDTO(
                type="message", # Важно: тип сообщения, как ожидает клиент
                thread_id=str(message_input.thread_id),
                sender_id=str(sender_id),
                sender_type=sender_type,
                message=message_input.message,
                message_id=str(created_message.id), # Используем ID созданного сообщения
                timestamp=created_message.created_at.isoformat() if created_message.created_at else datetime.now(timezone.utc).isoformat()
            )

            # Отправляем через WebSocket асинхронно
            # notify_new_chat_message_via_ws ожидает DTO
            asyncio.create_task(notify_new_chat_message_via_ws(
                thread_id=str(message_input.thread_id),
                message_dto=ws_message_dto
            ))
            logger.info(f"WebSocket notification task created for message {created_message.id} in thread {message_input.thread_id}")

        except Exception as e:
            # Логируем ошибку, но не прерываем выполнение основной функции
            logger.error(f"Failed to send WebSocket notification for message {created_message.id}: {e}")
            # В зависимости от политики, можно добавить здесь обработку ошибки,
            # например, помещение уведомления в очередь для повторной отправки.

        # Additionally, if the sender is a buyer, send a global notification to the seller
        if sender_type == "buyer" and thread: # Ensure thread object is available
            try:
                seller_global_notification_payload = {
                    "type": "new_chat_message",
                    "thread_id": str(message_input.thread_id),
                    "message_id": str(created_message.id),
                    "sender_id": str(sender_id), # This is the buyer_id
                    "message_preview": message_input.message[:50] + "..." if message_input.message else "", # Optional: message preview
                    "timestamp": created_message.created_at.isoformat() if created_message.created_at else datetime.now(timezone.utc).isoformat()
                }
                asyncio.create_task(send_global_seller_notification(
                    seller_id=str(thread.seller_id), # Get seller_id from the thread object
                    notification_data=seller_global_notification_payload
                ))
                logger.info(f"Global new_chat_message notification task created for seller {thread.seller_id} regarding message {created_message.id}")
            except Exception as e:
                logger.error(f"Failed to send global new_chat_message notification to seller {thread.seller_id}: {e}")

        return created_message

    async def example_send_order_notification(self, seller_id: UUID, order_details: dict):
        """
        Пример функции, которая могла бы отправлять глобальное уведомление продавцу.
        Эта функция не вызывается напрямую из ChatService в текущей логике,
        а служит примером интеграции send_global_seller_notification.
        """
        try:
            notification_payload = {
                "type": "new_order", # Тип уведомления, который клиент сможет обработать
                "order_id": str(order_details.get("id")),
                "buyer_name": order_details.get("buyer_name", "Unknown Buyer"),
                "total_amount": order_details.get("total_amount", 0.0),
                # ... другие детали заказа
            }
            logger.info(f"Attempting to send global 'new_order' notification to seller {seller_id}")
            success = await send_global_seller_notification(str(seller_id), notification_payload)
            if success:
                logger.info(f"Global 'new_order' notification successfully sent to seller {seller_id}")
            else:
                logger.warning(f"Failed to send global 'new_order' notification to seller {seller_id} (send_global_seller_notification returned False)")
        except Exception as e:
            logger.error(f"Error in example_send_order_notification for seller {seller_id}: {e}")

    async def get_thread_messages(self, thread_id: UUID, limit: int = 50) -> list[ChatMessage]:
        """Get messages for a specific thread."""
        return await self.daos.chat_message.get_by_thread_id(thread_id, limit)

    async def mark_messages_as_read(
        self, 
        thread_id: UUID, 
        user_id: UUID, 
        user_type: str
    ) -> None:
        """Mark messages as read for a user."""
        if user_type == "buyer":
            await self.daos.chat_message.mark_as_read_by_buyer(thread_id, user_id)
        elif user_type == "seller":
            await self.daos.chat_message.mark_as_read_by_seller(thread_id, user_id)
        else:
            raise ValueError("Invalid user type")

    async def get_unread_count(
        self, 
        user_id: UUID, 
        user_type: str, 
        thread_id: UUID | None = None
    ) -> int:
        """Get unread message count for a user."""
        if user_type == "buyer":
            return await self.daos.chat_message.count_unread_for_buyer(user_id, thread_id)
        elif user_type == "seller":
            return await self.daos.chat_message.count_unread_for_seller(user_id, thread_id)
        else:
            raise ValueError("Invalid user type")

    def create_websocket_message(
        self,
        message_type: str,
        thread_id: UUID,
        sender_id: UUID,
        sender_type: str, # 'buyer' or 'seller'
        message: str | None = None,
        message_id: UUID | None = None,
        # timestamp можно сделать опциональным, если он всегда now()
        timestamp: datetime | None = None
    ) -> WebSocketMessageDTO:
        """Create a WebSocket message DTO."""
        return WebSocketMessageDTO(
            type=message_type,
            thread_id=str(thread_id), # Убедимся что это строка
            sender_id=str(sender_id), # Убедимся что это строка
            sender_type=sender_type,
            message=message,
            timestamp=(timestamp or datetime.now(timezone.utc)).isoformat(), # Преобразуем в ISO строку
            message_id=str(message_id) if message_id else None # Убедимся что это строка или None
        )
