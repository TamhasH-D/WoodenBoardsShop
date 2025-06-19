from collections.abc import Sequence
from typing import Any, Generic, TypeVar, Union, get_args, get_origin, Optional
from uuid import UUID

import sqlalchemy as sa
from pydantic import BaseModel, parse_raw_as
from sqlalchemy.ext.asyncio.session import AsyncSession
import redis.asyncio as redis

from backend.db import Base
from backend.dtos import (
    OffsetPaginationMetadata,
    OffsetResults,
    PaginationParams,
    PaginationParamsSortBy,
)
from backend.settings import settings # Added

PaginationType = Union[PaginationParams, PaginationParamsSortBy]
QueryType = Union[sa.Select[Any], sa.Update, sa.Delete]

Model = TypeVar('Model', bound=Base)
InputDTO = TypeVar('InputDTO', bound=BaseModel)
UpdateDTO = TypeVar('UpdateDTO', bound=BaseModel)
OutDTO = TypeVar('OutDTO', bound=BaseModel)


class BaseDAO(Generic[Model, InputDTO, UpdateDTO, OutDTO]):
    """
    Base class for all Data Access Objects (DAOs).

    Inherit from this class to create a new DAO that provides CRUD operations
    for a specific model.

    Example:
        To create a new DAO for a model called `User`, define a new class like so:

        >>> class UserDAO(BaseDAO[User, UserInputDTO, UserUpdateDTO, UserOutDTO]): # UserOutDTO is an example
        >>>     ...

    """

    model: type[Model]
    out_dto: type[OutDTO]

    def __init_subclass__(
        cls,
    ) -> None:
        # Get the model and DTO types from the generic base class
        for base in cls.__orig_bases__:
            if get_origin(base) is BaseDAO:
                args = get_args(base)
                if len(args) < 4:
                    raise TypeError(
                        f"BaseDAO generic arguments missing. Expected Model, InputDTO, UpdateDTO, OutDTO. Got: {args}"
                    )
                cls.model = args[0]
                # InputDTO is args[1], UpdateDTO is args[2]
                cls.out_dto = args[3]
                break
        if not hasattr(cls, 'model') or not hasattr(cls, 'out_dto'):
             raise TypeError(
                f"Could not initialize model or out_dto for DAO {cls.__name__}. "
                "Ensure it inherits from BaseDAO with all type arguments."
            )


    def __init__(
        self,
        session: AsyncSession,
        redis_client: Optional[redis.Redis] = None,
    ):
        self.session = session
        self.redis_client = redis_client

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
        if not hasattr(self.model, sort_by):
            print(f"Warning: Invalid sort parameter '{sort_by}' for model {self.model.__name__}.")
            sort_by = 'created_at' if hasattr(self.model, 'created_at') else 'id'

        sort_order = sort_order.lower() if sort_order else 'asc'
        if sort_order not in ['asc', 'desc']:
            print(f"Warning: Invalid sort order '{sort_order}'. Using 'asc' instead.")
            sort_order = 'asc'

        try:
            column = getattr(self.model, sort_by)
            if sort_order == 'desc':
                return query.order_by(sa.desc(column))
            else:
                return query.order_by(sa.asc(column))
        except Exception as e:
            print(f"Error applying sort: {e}. Using default sorting.")
            default_sort_key = 'created_at' if hasattr(self.model, 'created_at') else 'id'
            if hasattr(self.model, default_sort_key):
                 return query.order_by(sa.desc(getattr(self.model, default_sort_key)))
            return query

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

    async def get_by_id(self, id_: UUID) -> Optional[OutDTO]:
        """Get a record by ID with caching."""
        cache_key = f"BaseDAO:{self.model.__name__}:id:{id_}"
        if self.redis_client:
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                return self.out_dto.model_validate_json(cached_data)

        db_obj = await self.session.get(self.model, id_)
        if db_obj:
            dto_instance = self.out_dto.model_validate(db_obj)
            if self.redis_client:
                await self.redis_client.set(
                    cache_key,
                    dto_instance.model_dump_json(),
                    ex=settings.redis.cache_ttl_seconds # Updated TTL
                )
            return dto_instance
        return None

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
        if self.redis_client:
            # Invalidate common/default get_all_paginated cache
            default_sort_by = 'created_at' if hasattr(self.model, 'created_at') else 'id'
            default_sort_order = 'asc'
            cache_key_to_invalidate = f"BaseDAO:{self.model.__name__}:all_paginated:limit:10:offset:0:sort_by:{default_sort_by}:sort_order:{default_sort_order}"
            await self.redis_client.delete(cache_key_to_invalidate)
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
        if self.redis_client:
            cache_key = f"BaseDAO:{self.model.__name__}:id:{id}"
            await self.redis_client.delete(cache_key)
            default_sort_by = 'created_at' if hasattr(self.model, 'created_at') else 'id'
            default_sort_order = 'asc'
            cache_key_to_invalidate = f"BaseDAO:{self.model.__name__}:all_paginated:limit:10:offset:0:sort_by:{default_sort_by}:sort_order:{default_sort_order}"
            await self.redis_client.delete(cache_key_to_invalidate)

    async def delete(
        self,
        **filter_params: Any,
    ) -> None:
        """Delete records by filter parameters."""
        query = sa.delete(self.model)
        query = self._apply_param_filters(query, **filter_params)
        await self.session.execute(query)
        if self.redis_client:
            default_sort_by = 'created_at' if hasattr(self.model, 'created_at') else 'id'
            default_sort_order = 'asc'
            cache_key_to_invalidate = f"BaseDAO:{self.model.__name__}:all_paginated:limit:10:offset:0:sort_by:{default_sort_by}:sort_order:{default_sort_order}"
            await self.redis_client.delete(cache_key_to_invalidate)

    async def delete_by_id(self, id_: UUID) -> None:
        """Delete a record by its ID and invalidate cache."""
        target_column = self.model.get_primary_key_column()
        query = sa.delete(self.model).where(target_column == id_)
        result = await self.session.execute(query)

        if result.rowcount and result.rowcount > 0 and self.redis_client:
            cache_key = f"BaseDAO:{self.model.__name__}:id:{id_}"
            await self.redis_client.delete(cache_key)
            default_sort_by = 'created_at' if hasattr(self.model, 'created_at') else 'id'
            default_sort_order = 'asc'
            cache_key_to_invalidate = f"BaseDAO:{self.model.__name__}:all_paginated:limit:10:offset:0:sort_by:{default_sort_by}:sort_order:{default_sort_order}"
            await self.redis_client.delete(cache_key_to_invalidate)

    async def get_offset_results(
        self,
        pagination: PaginationType,
        query: Union[sa.sql.Select[tuple[Model]], None] = None,
    ) -> OffsetResults[OutDTO]:
        """Get offset paginated results with caching."""
        if query is None:
            query = sa.select(self.model)

        sort_info = ""
        if isinstance(pagination, PaginationParamsSortBy):
            sort_info = f":sort_by:{pagination.sort_by}:sort_order:{pagination.sort_order}"

        cache_key = f"BaseDAO:{self.model.__name__}:all_paginated:limit:{pagination.limit}:offset:{pagination.offset}{sort_info}"

        if self.redis_client:
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                try:
                    return parse_raw_as(OffsetResults[self.out_dto], cached_data)
                except Exception as e:
                    print(f"Cache deserialization error for {cache_key}: {e}")

        if isinstance(pagination, PaginationParamsSortBy):
            query = self._apply_sort(
                query,
                pagination.sort_by,
                pagination.sort_order,
            )

        computed_pagination = await self._compute_offset_pagination(query)
        query = query.offset(pagination.offset).limit(pagination.limit)

        results = await self.session.execute(query)

        validated_data = [self.out_dto.model_validate(row) for row in results.scalars()]
        offset_results_obj = OffsetResults[self.out_dto](
            data=validated_data,
            pagination=computed_pagination,
        )

        if self.redis_client:
            await self.redis_client.set(
                cache_key,
                offset_results_obj.model_dump_json(),
                ex=settings.redis.cache_ttl_seconds # Updated TTL
            )

        return offset_results_obj
