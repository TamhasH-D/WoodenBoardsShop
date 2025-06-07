from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class SellerDTO(BaseOrmModel):
    """Seller DTO."""

    id: UUID
    keycloak_uuid: UUID
    is_online: bool
    created_at: datetime
    updated_at: datetime


class SellerInputDTO(BaseModel):
    """Seller input DTO."""

    id: UUID
    keycloak_uuid: UUID
    is_online: bool = False


class SellerUpdateDTO(BaseModel):
    """Seller update DTO."""

    is_online: bool | None = None
