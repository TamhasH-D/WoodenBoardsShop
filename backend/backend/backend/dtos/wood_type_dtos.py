from uuid import UUID

from pydantic import BaseModel

from backend.dtos import BaseOrmModel


class WoodTypeDTO(BaseOrmModel):
    """WoodType DTO."""

    id: UUID
    name: str # Corrected from neme
    description: str | None


class WoodTypeInputDTO(BaseModel):
    """WoodType input DTO."""

    id: UUID
    name: str # Corrected from neme
    description: str | None


class WoodTypeUpdateDTO(BaseModel):
    """WoodType update DTO."""

    name: str | None = None # Corrected from neme
    description: str | None = None
