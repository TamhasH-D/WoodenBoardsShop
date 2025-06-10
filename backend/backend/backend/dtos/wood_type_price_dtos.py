from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class WoodTypePriceDTO(BaseOrmModel):
    """WoodTypePrice DTO."""

    id: UUID
    price_per_m3: float
    created_at: datetime
    wood_type_id: UUID


class WoodTypePriceInputDTO(BaseModel):
    """WoodTypePrice input DTO."""

    id: UUID
    price_per_m3: float
    wood_type_id: UUID


class WoodTypePriceUpdateDTO(BaseModel):
    """WoodTypePrice update DTO."""

    price_per_m3: float | None = None
    wood_type_id: UUID | None = None
