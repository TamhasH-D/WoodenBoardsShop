from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from backend.dtos import BaseOrmModel


class WoodenBoardDTO(BaseOrmModel):
    """WoodenBoard DTO."""

    id: UUID
    height: float = Field(..., description="Height in meters")
    width: float = Field(..., description="Width in meters")
    length: float = Field(..., description="Length in meters")  # Fixed typo to match migration
    volume: float = Field(..., description="Calculated volume in cubic meters")
    confidence: float = Field(..., description="AI detection confidence (0-1)")
    created_at: datetime
    updated_at: datetime
    image_id: UUID
    product_id: UUID


class WoodenBoardInputDTO(BaseModel):
    """WoodenBoard input DTO."""

    id: UUID | None = None  # Allow id to be provided for testing
    height: float = Field(..., gt=0, description="Height in meters")
    width: float = Field(..., gt=0, description="Width in meters")
    length: float = Field(..., gt=0, description="Length in meters")  # Fixed typo to match migration
    volume: float | None = Field(None, gt=0, description="Calculated volume in cubic meters")  # Make optional
    confidence: float | None = Field(None, ge=0, le=1, description="AI detection confidence (0-1)")  # Make optional
    image_id: UUID
    product_id: UUID | None = None  # Make optional for tests


class WoodenBoardUpdateDTO(BaseModel):
    """WoodenBoard update DTO."""

    height: float | None = Field(None, gt=0, description="Height in meters")
    width: float | None = Field(None, gt=0, description="Width in meters")
    length: float | None = Field(None, gt=0, description="Length in meters")  # Fixed typo to match migration
    volume: float | None = Field(None, gt=0, description="Calculated volume in cubic meters")
    confidence: float | None = Field(None, ge=0, le=1, description="AI detection confidence (0-1)")
    image_id: UUID | None = None
    product_id: UUID | None = None
