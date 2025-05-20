

from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class WoodTypeDTO(BaseOrmModel):
    """WoodType DTO."""

    id: UUID
    neme: str
    description: str | None


class WoodTypeInputDTO(BaseModel):
    """WoodType input DTO."""

    neme: str
    description: str | None


class WoodTypeUpdateDTO(BaseModel):
    """WoodType update DTO."""

    neme: str | None = None
    description: str | None = None
