from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class ChatMessageDTO(BaseOrmModel):
    """ChatMessage DTO."""

    id: UUID
    message: str
    is_read_by_buyer: bool
    is_read_by_seller: bool
    created_at: datetime
    thread_id: UUID
    buyer_id: UUID
    seller_id: UUID


class ChatMessageInputDTO(BaseModel):
    """ChatMessage input DTO."""

    id: UUID
    message: str
    is_read_by_buyer: bool = False
    is_read_by_seller: bool = False
    thread_id: UUID
    buyer_id: UUID
    seller_id: UUID


class ChatMessageUpdateDTO(BaseModel):
    """ChatMessage update DTO."""

    message: str | None = None
    is_read_by_buyer: bool | None = None
    is_read_by_seller: bool | None = None
    thread_id: UUID | None = None
    buyer_id: UUID | None = None
    seller_id: UUID | None = None
