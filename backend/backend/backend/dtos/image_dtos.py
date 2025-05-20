

from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class ImageDTO(BaseOrmModel):
    """Image DTO."""

    id: UUID
    image_path: str
    product_id: UUID


class ImageInputDTO(BaseModel):
    """Image input DTO."""

    id: UUID
    image_path: str
    product_id: UUID


class ImageUpdateDTO(BaseModel):
    """Image update DTO."""

    image_path: str | None = None
    product_id: UUID | None = None
