

from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class WoodenBoardDTO(BaseOrmModel):
    """WoodenBoard DTO."""

    id: UUID
    height: float
    width: float
    lenght: float
    image_id: UUID


class WoodenBoardInputDTO(BaseModel):
    """WoodenBoard input DTO."""

    id: UUID
    height: float
    width: float
    lenght: float
    image_id: UUID


class WoodenBoardUpdateDTO(BaseModel):
    """WoodenBoard update DTO."""

    height: float | None = None
    width: float | None = None
    lenght: float | None = None
    image_id: UUID | None = None
