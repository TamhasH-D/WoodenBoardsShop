from typing import Annotated, Generic, TypeVar, Union
from uuid import UUID

from fastapi import Depends
from pydantic import BaseModel, ConfigDict, Field

T = TypeVar('T', bound=BaseModel)

#############
# Base DTOs #
#############


class BaseOrmModel(BaseModel):
    """Base ORM model."""

    model_config = ConfigDict(from_attributes=True)


######################
# Data Response DTOs #
######################


class DataResponse(BaseModel, Generic[T]):
    """Model for response data."""

    data: Union[T, None] = None


class CreatedResponse(BaseModel):
    """Model for created objects, returning the id."""

    id: UUID


class EmptyResponse(BaseModel):
    """Model for empty response."""

    data: None = None


###################
# Pagination DTOs #
###################


class PaginationParams(BaseModel):
    """DTO for offset pagination."""

    offset: int = Field(0, ge=0)
    limit: int = Field(20, le=20, ge=1)


class PaginationParamsSortBy(PaginationParams):
    """DTO for offset pagination with sorting."""

    sort_by: str = Field(..., description="Field to sort by")
    sort_order: str = Field("asc", pattern="^(asc|desc)$", description="Sort order: asc or desc")


class OffsetPaginationMetadata(BaseModel):
    """DTO for offset pagination metadata."""

    total: int


class OffsetResults(BaseModel, Generic[T]):
    """DTO for offset paginated response."""

    data: list[T]
    pagination: OffsetPaginationMetadata


Pagination = Annotated[PaginationParams, Depends()]
