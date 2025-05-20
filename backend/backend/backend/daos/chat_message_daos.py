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
