from typing import Optional, List
from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel
from backend.dtos.wooden_board_dtos import WoodenBoardDTO # Added import


class ImageDTO(BaseOrmModel):
    """Image DTO."""

    id: UUID
    image_path: str
    product_id: UUID
    wooden_boards: Optional[List[WoodenBoardDTO]] = None # Added field


class ImageInputDTO(BaseModel):
    """Image input DTO."""

    id: UUID
    image_path: str
    product_id: UUID


class ImageUpdateDTO(BaseModel):
    """Image update DTO."""

    image_path: str | None = None
    product_id: UUID | None = None
