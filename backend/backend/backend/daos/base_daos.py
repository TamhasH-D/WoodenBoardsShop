import json # Added
from collections.abc import Sequence
from typing import Any, Generic, TypeVar, Union, get_args, get_origin, Optional, Type # Added Type
from uuid import UUID

import sqlalchemy as sa
from pydantic import BaseModel
from sqlalchemy.ext.asyncio.session import AsyncSession

from backend.cache_manager import cache_manager
from backend.db import Base # Assuming Base model has an 'id' attribute
from backend.dtos import (
    OffsetPaginationMetadata,
    OffsetResults,
    PaginationParams,
    PaginationParamsSortBy,
)

PaginationType = Union[PaginationParams, PaginationParamsSortBy]
QueryType = Union[sa.Select[Any], sa.Update, sa.Delete]

Model = TypeVar('Model', bound=Base) # Model is bound to Base, expecting 'id'
InputDTO = TypeVar('InputDTO', bound=BaseModel)
UpdateDTO = TypeVar('UpdateDTO', bound=BaseModel)
OutDTO = TypeVar('OutDTO', bound=BaseModel)


class BaseDAO(Generic[Model, InputDTO, UpdateDTO, OutDTO]):
    """
    Base class for all Data Access Objects (DAOs).

    Inherit from this class to create a new DAO that provides CRUD operations
    for a specific model. Assumes models have an 'id' attribute for PK.

    Example:
        To create a new DAO for a model called `User`, define a new class like so:

        >>> class UserDAO(BaseDAO[User, UserInputDTO, UserUpdateDTO, UserOutDTO]):
        >>>     ...

    """

    model: type[Model]

    def __init_subclass__(
        cls,
    ) -> None:
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
        for key, value in filter_params.items():
            if hasattr(self.model, key):
                query = query.filter(getattr(self.model, key) == value)
            else:
                raise ValueError(f"Invalid filter parameter: {key}")
        return query

    def _apply_base_filter(
        self,
        query: Union[sa.Select[Any], None] = None,
        loads: Union[list[Any], None] = None,
        **filter_params: Any,
    ) -> sa.Select[tuple[Model]]:
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
            default_sort_col = getattr(self.model, 'created_at', getattr(self.model, 'id', None))
            if default_sort_col is not None:
                 return query.order_by(sa.desc(default_sort_col)) # type: ignore
            return query


    async def _compute_offset_pagination(
        self,
        query: sa.Select[tuple[Model]],
    ) -> OffsetPaginationMetadata:
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
        record = self.model(
            **input_dto.model_dump(),
        )
        self.session.add(record)
        await self.session.flush()
        await cache_manager.delete(f"{self.model.__name__}:all") # Invalidate "all items" cache
        return record

    async def get_by_id(self, item_id: Union[UUID, int, str], out_dto_class: type[OutDTO]) -> Optional[OutDTO]:
        """Get a single record by its ID and map to out_dto_class."""
        cache_key = f"{self.model.__name__}:{item_id}"
        cached_item = await cache_manager.get(cache_key, out_dto_class)
        if cached_item:
            return cached_item

        query = sa.select(self.model).filter(self.model.id == item_id)
        result = await self.session.execute(query)
        instance = result.scalar_one_or_none()

        if instance:
            dto_instance = out_dto_class.model_validate(instance)
            await cache_manager.set(cache_key, dto_instance)
            return dto_instance
        return None

    async def get_all_cached(self, out_dto_class: Type[OutDTO]) -> list[OutDTO]: # Changed type to Type
        cache_key = f"{self.model.__name__}:all"

        cached_data_str = await cache_manager.get_raw(cache_key)
        if cached_data_str:
            try:
                items_data = json.loads(cached_data_str)
                return [out_dto_class.model_validate(item_data) for item_data in items_data]
            except json.JSONDecodeError:
                # Optionally log this error
                pass # Proceed to fetch from DB

        # If not in cache or deserialization error, fetch from DB
        query = sa.select(self.model)
        result = await self.session.execute(query)
        instances = result.scalars().all()

        dto_list = [out_dto_class.model_validate(instance) for instance in instances]

        # Store the JSON string of the list in cache
        # Convert DTOs to dicts before serializing the list to JSON
        try:
            list_of_dicts = [dto.model_dump() for dto in dto_list]
            await cache_manager.set_raw(cache_key, json.dumps(list_of_dicts))
        except Exception as e:
            # Optionally log this error if serialization/caching fails
            print(f"Error caching 'all items' for {self.model.__name__}: {e}")
            pass

        return dto_list

    async def filter(
        self,
        loads: Union[list[Any], None] = None,
        **filter_params: Any,
    ) -> Union[Sequence[Model], None]:
        query = self._apply_base_filter(loads=loads, **filter_params)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def filter_first(
        self,
        loads: Union[list[Any], None] = None,
        **filter_params: Any,
    ) -> Union[Model, None]:
        query = self._apply_base_filter(loads=loads, **filter_params)
        query = query.limit(1)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def update(
        self,
        item_id: Union[UUID, int, str],
        update_dto: UpdateDTO,
        out_dto_class: type[OutDTO] # Changed type to Type
    ) -> Optional[OutDTO]:
        """Update a record by ID and return the updated DTO."""
        update_dict = update_dto.model_dump(exclude_none=True, mode='python')
        if not update_dict:
            return None

        stmt = (
            sa.update(self.model)
            .where(self.model.id == item_id)
            .values(**update_dict)
            .returning(self.model)
        )
        result = await self.session.execute(stmt)
        updated_instance = result.scalar_one_or_none()

        if updated_instance:
            await self.session.flush()
            cache_key = f"{self.model.__name__}:{item_id}"
            await cache_manager.delete(cache_key)
            await cache_manager.delete(f"{self.model.__name__}:all") # Invalidate "all items" cache
            return out_dto_class.model_validate(updated_instance)

        await self.session.rollback()
        return None


    async def delete(
        self,
        item_id: Union[UUID, int, str],
    ) -> bool:
        """Delete a record by its ID."""
        query = sa.delete(self.model).where(self.model.id == item_id)
        result = await self.session.execute(query)

        if result.rowcount > 0:
            await self.session.flush()
            cache_key = f"{self.model.__name__}:{item_id}"
            await cache_manager.delete(cache_key)
            await cache_manager.delete(f"{self.model.__name__}:all") # Invalidate "all items" cache
            return True

        await self.session.rollback()
        return False

    async def get_offset_results(
        self,
        out_dto: type[OutDTO], # Changed type to Type
        pagination: PaginationType,
        query: Union[sa.sql.Select[tuple[Model]], None] = None,
    ) -> OffsetResults[OutDTO]:
        if query is None:
            query = sa.select(self.model)

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
