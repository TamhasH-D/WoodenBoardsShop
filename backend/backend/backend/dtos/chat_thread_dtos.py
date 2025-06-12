from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class ChatThreadDTO(BaseOrmModel):
    """ChatThread DTO."""

    id: UUID
    created_at: datetime
    buyer_id: UUID
    seller_id: UUID


class ChatThreadInputDTO(BaseModel):
    """ChatThread input DTO."""

    id: UUID
    buyer_id: UUID
    seller_id: UUID


class ChatThreadUpdateDTO(BaseModel):
    """ChatThread update DTO."""

    buyer_id: UUID | None = None
    seller_id: UUID | None = None


class ChatThreadWithLastMessageDTO(BaseOrmModel):
    """ChatThread with last message DTO."""

    id: UUID
    created_at: datetime
    buyer_id: UUID
    seller_id: UUID
    last_message: str | None = None
    last_message_time: datetime | None = None
    unread_count: int = 0
