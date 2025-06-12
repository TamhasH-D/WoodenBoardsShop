from collections.abc import Sequence
from typing import Any, Generic, TypeVar, Union, get_args, get_origin
from uuid import UUID

import sqlalchemy as sa
from pydantic import BaseModel
from sqlalchemy.ext.asyncio.session import AsyncSession

from backend.db import Base
from backend.dtos import (
    OffsetPaginationMetadata,
    OffsetResults,
    PaginationParams,
    PaginationParamsSortBy,
)

PaginationType = Union[PaginationParams, PaginationParamsSortBy]
QueryType = Union[sa.Select[Any], sa.Update, sa.Delete]

Model = TypeVar('Model', bound=Base)
InputDTO = TypeVar('InputDTO', bound=BaseModel)
UpdateDTO = TypeVar('UpdateDTO', bound=BaseModel)


class BaseDAO(Generic[Model, InputDTO, UpdateDTO]):
    """
    Base class for all Data Access Objects (DAOs).

    Inherit from this class to create a new DAO that provides CRUD operations
    for a specific model.

    Example:
        To create a new DAO for a model called `User`, define a new class like so:

        >>> class UserDAO(BaseDAO[User, UserInputDTO, UserUpdateDTO]):
        >>>     ...

    """

    model: type[Model]

    def __init_subclass__(
        cls,
    ) -> None:
        # Get the model type from the generic base class
        for base in cls.__orig_bases__:
            if get_origin(base) is BaseDAO:
                cls.model = get_args(base)[0]
                break

    def __init__(
        self,
        session: AsyncSession,
    ):
        self.session = session

    ###################
    # Private methods #
    ###################

    def _apply_param_filters(
        self, query: QueryType, **filter_params: Any
    ) -> QueryType:
        """Apply filters to query."""
        for key, value in filter_params.items():
            if hasattr(self.model, key):
                query = query.filter(getattr(self.model, key) == value)  # type: ignore
            else:
                raise ValueError(f"Invalid filter parameter: {key}")
        return query

    def _apply_base_filter(
        self,
        query: Union[sa.Select[Any], None] = None,
        loads: Union[list[Any], None] = None,
        **filter_params: Any,
    ) -> sa.Select[tuple[Model]]:
        """Get records by filter parameters."""
        if query is None:
            query = sa.select(self.model)
        query = self._apply_param_filters(query, **filter_params)
        if loads is not None:
            query = query.options(*loads)
        return query

    def _apply_sort(
        self,
        query: sa.Select[tuple[Model]],
        sort_by: str,
        sort_order: str,
    ) -> sa.Select[tuple[Model]]:
        """Apply sorting to query."""
        if hasattr(self.model, sort_by) is False:
            raise ValueError(f"Invalid sort parameter: {sort_by}")

        # Normalize sort_order and apply correct SQLAlchemy function
        sort_order = sort_order.lower()
        if sort_order not in ['asc', 'desc']:
            raise ValueError(f"Invalid sort order: {sort_order}. Must be 'asc' or 'desc'")

        column = getattr(self.model, sort_by)
        if sort_order == 'desc':
            return query.order_by(sa.desc(column))
        else:
            return query.order_by(sa.asc(column))

    async def _compute_offset_pagination(
        self,
        query: sa.Select[tuple[Model]],
    ) -> OffsetPaginationMetadata:
        """Compute offset pagination metadata."""
        count_query = sa.select(sa.func.count()).select_from(query.subquery())
        result = await self.session.execute(count_query)
        total = result.scalar_one_or_none() or 0
        return OffsetPaginationMetadata(total=total)

    ##################
    # Public methods #
    ##################

    async def create(
        self,
        input_dto: InputDTO,
    ) -> Model:
        """Create and return a new record."""
        record = self.model(
            **input_dto.model_dump(),
        )
        self.session.add(record)
        await self.session.flush()
        return record

    async def filter(
        self,
        loads: Union[list[Any], None] = None,
        **filter_params: Any,
    ) -> Union[Sequence[Model], None]:
        """Get records by filter parameters."""
        query = self._apply_base_filter(loads=loads, **filter_params)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def filter_first(
        self,
        loads: Union[list[Any], None] = None,
        **filter_params: Any,
    ) -> Union[Model, None]:
        """Get a single record by filter parameters."""
        query = self._apply_base_filter(loads=loads, **filter_params)
        query = query.limit(1)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def update(
        self,
        id: UUID,
        update_dto: UpdateDTO,
    ) -> None:
        """Update a record by ID."""
        update_dict = update_dto.model_dump(exclude_none=True)
        if not update_dict:
            return
        query = (
            sa.update(self.model)
            .where(self.model.get_primary_key_column() == id)
            .values(
                **update_dict,
            )
        )
        await self.session.execute(query)

    async def delete(
        self,
        **filter_params: Any,
    ) -> None:
        """Delete records by filter parameters."""
        query = sa.delete(self.model)
        query = self._apply_param_filters(query, **filter_params)
        await self.session.execute(query)

    async def get_offset_results(
        self,
        out_dto: type[BaseModel],
        pagination: PaginationType,
        query: Union[sa.sql.Select[tuple[Model]], None] = None,
    ) -> OffsetResults[BaseModel]:
        """Get offset paginated results."""
        if query is None:
            query = sa.select(self.model)

        # Apply sorting BEFORE pagination if provided
        if isinstance(pagination, PaginationParamsSortBy):
            query = self._apply_sort(
                query,
                pagination.sort_by,
                pagination.sort_order,
            )

        computed_pagination = await self._compute_offset_pagination(query)
        query = query.offset(pagination.offset).limit(pagination.limit)

        results = await self.session.execute(query)

        return OffsetResults(
            data=[out_dto.model_validate(row) for row in results.scalars()],
            pagination=computed_pagination,
        )
