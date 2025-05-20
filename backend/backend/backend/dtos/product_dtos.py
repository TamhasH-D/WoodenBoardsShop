from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class ProductDTO(BaseOrmModel):
    """Product DTO."""

    id: UUID
    volume: float
    price: float
    title: str
    descrioption: str | None
    delivery_possible: bool
    pickup_location: str | None
    created_at: datetime
    updated_at: datetime
    seller_id: UUID
    wood_type_id: UUID


class ProductInputDTO(BaseModel):
    """Product input DTO."""

    id: UUID
    volume: float
    price: float
    title: str
    descrioption: str | None
    delivery_possible: bool = False
    pickup_location: str | None
    seller_id: UUID
    wood_type_id: UUID


class ProductUpdateDTO(BaseModel):
    """Product update DTO."""

    volume: float | None = None
    price: float | None = None
    title: str | None = None
    descrioption: str | None = None
    delivery_possible: bool | None = None
    pickup_location: str | None = None
    seller_id: UUID | None = None
    wood_type_id: UUID | None = None
