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

    buyer_id: UUID
    seller_id: UUID


class ChatThreadUpdateDTO(BaseModel):
    """ChatThread update DTO."""

    buyer_id: UUID | None = None
    seller_id: UUID | None = None
