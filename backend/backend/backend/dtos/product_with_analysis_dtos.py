from uuid import UUID
from pydantic import BaseModel
from typing import Dict, Any


class ProductWithAnalysisResponseDTO(BaseModel):
    """Response DTO for product creation with analysis."""
    
    product_id: UUID
    seller_id: UUID
    image_id: UUID
    analysis_result: Dict[str, Any]
    wooden_boards_count: int
    total_volume: float
    message: str
