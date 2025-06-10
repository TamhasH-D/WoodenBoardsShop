from uuid import UUID
from pydantic import BaseModel, Field
from fastapi import UploadFile


class ProductWithAnalysisInputDTO(BaseModel):
    """DTO for creating product with image analysis."""
    
    # Seller identification
    keycloak_id: UUID = Field(..., description="Keycloak UUID продавца")
    
    # Product basic info
    title: str = Field(..., min_length=1, max_length=200, description="Название товара")
    description: str | None = Field(None, max_length=1000, description="Описание товара")
    
    # Wood type
    wood_type_id: UUID = Field(..., description="UUID типа древесины")
    
    # Board dimensions for analysis
    board_height: float = Field(..., gt=0, le=1000, description="Высота доски в мм")
    board_length: float = Field(..., gt=0, le=10000, description="Длина доски в мм")
    
    # Product parameters
    volume: float = Field(..., gt=0, le=1000, description="Объем в м³")
    price: float = Field(..., gt=0, le=999999, description="Цена в рублях")
    
    # Delivery options
    delivery_possible: bool = Field(default=False, description="Возможность доставки")
    pickup_location: str | None = Field(None, max_length=500, description="Адрес самовывоза")


class ProductWithAnalysisResponseDTO(BaseModel):
    """Response DTO for product creation with analysis."""
    
    product_id: UUID
    seller_id: UUID
    image_id: UUID
    analysis_result: dict
    wooden_boards_count: int
    total_volume: float
    message: str
