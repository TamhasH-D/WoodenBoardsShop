"""DTOs for product operations with image analysis."""

from uuid import UUID
from pydantic import BaseModel, Field
from typing import Dict, Any


class ProductWithImageInputDTO(BaseModel):
    """Input DTO for creating product with image analysis."""

    seller_id: UUID = Field(..., description="UUID продавца")
    title: str = Field(..., min_length=1, max_length=200, description="Название товара")
    description: str | None = Field(None, max_length=1000, description="Описание товара")
    wood_type_id: UUID = Field(..., description="Тип древесины")
    board_height: float = Field(..., gt=0, le=1000, description="Высота доски в мм")
    board_length: float = Field(..., gt=0, le=10000, description="Длина доски в мм")
    volume: float = Field(..., gt=0, description="Объем в м³")
    price: float = Field(..., gt=0, description="Цена в рублях")
    delivery_possible: bool = Field(False, description="Возможность доставки")
    pickup_location: str | None = Field(None, max_length=500, description="Адрес самовывоза")


class ProductWithImageUpdateDTO(BaseModel):
    """Update DTO for updating product with image analysis."""
    
    title: str | None = Field(None, min_length=1, max_length=200, description="Название товара")
    description: str | None = Field(None, max_length=1000, description="Описание товара")
    wood_type_id: UUID | None = Field(None, description="Тип древесины")
    board_height: float | None = Field(None, gt=0, le=1000, description="Высота доски в мм")
    board_length: float | None = Field(None, gt=0, le=10000, description="Длина доски в мм")
    volume: float | None = Field(None, gt=0, description="Объем в м³")
    price: float | None = Field(None, gt=0, description="Цена в рублях")
    delivery_possible: bool | None = Field(None, description="Возможность доставки")
    pickup_location: str | None = Field(None, max_length=500, description="Адрес самовывоза")


class ProductWithImageResponseDTO(BaseModel):
    """Response DTO for product operations with image analysis."""
    
    product_id: UUID
    seller_id: UUID
    image_id: UUID
    analysis_result: Dict[str, Any]
    wooden_boards_count: int
    total_volume: float
    message: str


class ImageAnalysisResultDTO(BaseModel):
    """DTO for image analysis results from YOLO backend."""
    
    wooden_boards: list[Dict[str, Any]]
    total_volume: float
    board_count: int
    analysis_metadata: Dict[str, Any] | None = None


class WoodenBoardDetectionDTO(BaseModel):
    """DTO for individual wooden board detection."""
    
    confidence: float = Field(..., ge=0, le=1, description="Уверенность детекции")
    class_name: str = Field(..., description="Класс объекта")
    points: list[Dict[str, float]] = Field(..., description="Координаты точек")
    dimensions: Dict[str, float] | None = Field(None, description="Размеры доски")
    volume: float | None = Field(None, description="Объем доски")


class ProductImageOperationDTO(BaseModel):
    """DTO for tracking product image operations."""
    
    operation_type: str = Field(..., description="Тип операции: create, update, delete")
    product_id: UUID
    old_image_ids: list[UUID] | None = Field(None, description="ID старых изображений")
    new_image_id: UUID | None = Field(None, description="ID нового изображения")
    analysis_performed: bool = Field(False, description="Был ли выполнен анализ")
    boards_detected: int | None = Field(None, description="Количество обнаруженных досок")
    volume_calculated: float | None = Field(None, description="Рассчитанный объем")
