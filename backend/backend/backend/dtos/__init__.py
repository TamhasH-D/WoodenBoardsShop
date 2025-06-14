from typing import Annotated, Generic, TypeVar, Union
from uuid import UUID

from fastapi import Depends, Query
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

    sort_by: Union[str, list[str]] = Query(default="created_at", description="Field or list of fields to sort by")
    sort_order: Union[str, list[str]] = Query(default="desc", description="Sort order: 'asc' or 'desc'. If sort_by is a list, this can be a single string (applied to all) or a list of strings (one for each field).")


class OffsetPaginationMetadata(BaseModel):
    """DTO for offset pagination metadata."""

    total: int


class OffsetResults(BaseModel, Generic[T]):
    """DTO for offset paginated response."""

    data: list[T]
    pagination: OffsetPaginationMetadata


Pagination = Annotated[PaginationParams, Depends()]
