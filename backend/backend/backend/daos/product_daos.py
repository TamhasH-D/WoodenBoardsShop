from typing import Any, Union, Optional
from uuid import UUID

import sqlalchemy as sa
from pydantic import BaseModel, parse_raw_as
import redis.asyncio as redis
from sqlalchemy.ext.asyncio import AsyncSession

from backend.daos.base_daos import BaseDAO, PaginationType
from backend.dtos import OffsetPaginationMetadata, OffsetResults, PaginationParamsSortBy, PaginationParams
from backend.dtos.product_dtos import (
    ProductFilterDTO,
    ProductInputDTO,
    ProductUpdateDTO,
    ProductFullDTO,
)
from backend.models.product_models import Product
from backend.settings import settings # Added


class ProductDAO(
    BaseDAO[
        Product,
        ProductInputDTO,
        ProductUpdateDTO,
        ProductFullDTO,
    ]
):
    """Product DAO."""

    def __init__(self, session: AsyncSession, redis_client: Optional[redis.Redis] = None):
        super().__init__(session, redis_client=redis_client)

    def _apply_advanced_filters(
        self,
        query: sa.Select[tuple[Product]],
        filters: ProductFilterDTO,
    ) -> sa.Select[tuple[Product]]:
        """Apply advanced filters to the query."""

        if filters.search_query:
            search_term = f"%{filters.search_query.lower()}%"
            query = query.filter(
                sa.or_(
                    sa.func.lower(Product.title).like(search_term),
                    sa.func.lower(Product.description).like(search_term)
                )
            )
        if filters.price_min is not None:
            query = query.filter(Product.price >= filters.price_min)
        if filters.price_max is not None:
            query = query.filter(Product.price <= filters.price_max)
        if filters.volume_min is not None:
            query = query.filter(Product.volume >= filters.volume_min)
        if filters.volume_max is not None:
            query = query.filter(Product.volume <= filters.volume_max)
        if filters.wood_type_ids:
            query = query.filter(Product.wood_type_id.in_(filters.wood_type_ids))
        if filters.seller_ids:
            query = query.filter(Product.seller_id.in_(filters.seller_ids))
        if filters.delivery_possible is not None:
            query = query.filter(Product.delivery_possible == filters.delivery_possible)
        if filters.has_pickup_location is not None:
            query = query.filter(Product.pickup_location.isnot(None) if filters.has_pickup_location else Product.pickup_location.is_(None))
        if filters.created_after is not None:
            query = query.filter(Product.created_at >= filters.created_after)
        if filters.created_before is not None:
            query = query.filter(Product.created_at <= filters.created_before)
        return query

    async def get_filtered_results(
        self,
        pagination: PaginationType,
        filters: ProductFilterDTO,
    ) -> OffsetResults[ProductFullDTO]:
        """Get filtered and paginated product results with caching."""

        filters_json = filters.model_dump_json(exclude_defaults=True)

        sort_by_val = "created_at"
        sort_order_val = "desc"
        if isinstance(pagination, PaginationParamsSortBy) and pagination.sort_by:
            sort_by_val = pagination.sort_by if isinstance(pagination.sort_by, str) else pagination.sort_by[0]
            sort_order_val = pagination.sort_order if isinstance(pagination.sort_order, str) else pagination.sort_order[0]

        sort_info = f":sort_by:{sort_by_val}:sort_order:{sort_order_val}"
        cache_key = f"ProductDAO:filtered:filters:{filters_json}:pagination:{pagination.limit}:{pagination.offset}{sort_info}"

        if self.redis_client:
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                try:
                    return parse_raw_as(OffsetResults[self.out_dto], cached_data)
                except Exception as e:
                    print(f"Cache deserialization error for {cache_key}: {e}")

        query = sa.select(Product)
        query = self._apply_advanced_filters(query, filters)

        if hasattr(Product, sort_by_val):
            query = self._apply_sort(query, sort_by_val, sort_order_val)
        else:
            print(f"Warning: Invalid sort field '{sort_by_val}' for Product model. Using default sorting.")
            query = self._apply_sort(query, "created_at", "desc")

        computed_pagination = await self._compute_offset_pagination(query)
        query = query.offset(pagination.offset).limit(pagination.limit)
        result = await self.session.execute(query)

        validated_data = [self.out_dto.model_validate(obj) for obj in result.scalars()]
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

    async def _invalidate_default_filtered_cache(self):
        if self.redis_client:
            default_filters = ProductFilterDTO()
            filters_json = default_filters.model_dump_json(exclude_defaults=True)
            default_limit = 10
            default_offset = 0
            default_sort_by = "created_at"
            default_sort_order = "desc"
            default_sort_info = f":sort_by:{default_sort_by}:sort_order:{default_sort_order}"
            cache_key_to_invalidate = f"ProductDAO:filtered:filters:{filters_json}:pagination:{default_limit}:{default_offset}{default_sort_info}"
            await self.redis_client.delete(cache_key_to_invalidate)
            print(f"Invalidated default filtered cache: {cache_key_to_invalidate}")

    async def create(self, input_dto: ProductInputDTO) -> Product:
        if not hasattr(self, 'out_dto'):
            raise AttributeError(f"out_dto is not configured for DAO {self.__class__.__name__}")
        product = await super().create(input_dto)
        await self._invalidate_default_filtered_cache()
        return product

    async def update(self, id: UUID, update_dto: ProductUpdateDTO) -> None:
        if not hasattr(self, 'out_dto'):
            raise AttributeError(f"out_dto is not configured for DAO {self.__class__.__name__}")
        await super().update(id, update_dto)
        await self._invalidate_default_filtered_cache()

    async def delete_by_id(self, id_: UUID) -> None:
        if not hasattr(self, 'out_dto'):
            raise AttributeError(f"out_dto is not configured for DAO {self.__class__.__name__}")
        await super().delete_by_id(id_)
        await self._invalidate_default_filtered_cache()
