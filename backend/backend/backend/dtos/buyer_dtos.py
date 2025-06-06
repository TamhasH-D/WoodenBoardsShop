from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class BuyerDTO(BaseOrmModel):
    """Buyer DTO."""

    id: UUID
    keycloak_uuid: UUID
    is_online: bool
    last_activity: datetime
    created_at: datetime
    updated_at: datetime


class BuyerInputDTO(BaseModel):
    """Buyer input DTO."""

    keycloak_uuid: UUID
    is_online: bool = False


class BuyerUpdateDTO(BaseModel):
    """Buyer update DTO."""

    is_online: bool | None = None
    last_activity: datetime | None = None
