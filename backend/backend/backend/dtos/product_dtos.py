from datetime import datetime
from uuid import UUID
from typing import List, Optional # Added/Ensured

from pydantic import BaseModel, Field

from backend.dtos import BaseOrmModel
from .image_dtos import ImageDTO # Added


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
    images: Optional[List[ImageDTO]] = None # New field


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


class ProductFilterDTO(BaseModel):
    """Product filter DTO for advanced search and filtering."""

    # Text search
    search_query: str | None = Field(None, description="Search in title and description")

    # Price range filters
    price_min: float | None = Field(None, ge=0, description="Minimum price filter")
    price_max: float | None = Field(None, ge=0, description="Maximum price filter")

    # Volume range filters
    volume_min: float | None = Field(None, ge=0, description="Minimum volume filter")
    volume_max: float | None = Field(None, ge=0, description="Maximum volume filter")

    # Multiple selection filters
    wood_type_ids: list[UUID] | None = Field(None, description="Filter by wood type IDs")
    seller_ids: list[UUID] | None = Field(None, description="Filter by seller IDs")

    # Boolean filters
    delivery_possible: bool | None = Field(None, description="Filter by delivery availability")
    has_pickup_location: bool | None = Field(None, description="Filter by pickup location availability")

    # Date range filters
    created_after: datetime | None = Field(None, description="Filter products created after this date")
    created_before: datetime | None = Field(None, description="Filter products created before this date")
