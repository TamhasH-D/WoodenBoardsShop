import json
from typing import Any, Union, Type, Optional # Added Optional for update return type
from uuid import UUID

import sqlalchemy as sa
from backend.dtos.product_dtos import ProductFilterDTO, ProductInputDTO, ProductUpdateDTO, ProductOutDTO
from backend.cache_manager import cache_manager
from backend.daos.base_daos import BaseDAO, PaginationType # InputDTO, UpdateDTO, OutDTO are implicitly available via BaseDAO generics
from backend.dtos import OffsetPaginationMetadata, OffsetResults, PaginationParamsSortBy
from backend.models.product_models import Product


class ProductDAO(
    BaseDAO[
        Product,
        ProductInputDTO,
        ProductUpdateDTO,
        ProductOutDTO,
    ]
):
    """Product DAO."""

    # --- Overridden CUD methods for pattern-based cache invalidation ---

    async def create(self, input_dto: ProductInputDTO) -> Product:
        """
        Create a new product, then invalidate product_filter cache.
        """
        # BaseDAO.create returns the model instance
        new_product_instance = await super().create(input_dto)
        if new_product_instance: # Should always be true if no exception
            await cache_manager.delete_by_pattern("product_filter:*")
        return new_product_instance

    async def update(
        self,
        item_id: Union[UUID, int, str],
        update_dto: ProductUpdateDTO, # Use specific DTO for Product
        out_dto_class: Type[ProductOutDTO] # Use specific DTO for Product
    ) -> Optional[ProductOutDTO]:
        """
        Update a product, then invalidate product_filter cache.
        """
        # BaseDAO.update returns the OutDTO instance or None
        updated_product_dto = await super().update(item_id, update_dto, out_dto_class)
        if updated_product_dto:
            await cache_manager.delete_by_pattern("product_filter:*")
        return updated_product_dto

    async def delete(self, item_id: Union[UUID, int, str]) -> bool:
        """
        Delete a product, then invalidate product_filter cache.
        """
        # BaseDAO.delete returns a boolean
        deleted_successfully = await super().delete(item_id)
        if deleted_successfully:
            await cache_manager.delete_by_pattern("product_filter:*")
        return deleted_successfully

    # --- Existing methods ---

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
                    sa.func.lower(Product.description).like(search_term) # Corrected typo here
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
            if filters.has_pickup_location:
                query = query.filter(Product.pickup_location.isnot(None))
            else:
                query = query.filter(Product.pickup_location.is_(None))
        if filters.created_after is not None:
            query = query.filter(Product.created_at >= filters.created_after)
        if filters.created_before is not None:
            query = query.filter(Product.created_at <= filters.created_before)
        return query

    async def get_filtered_results(
        self,
        out_dto_class: Type[ProductOutDTO],
        pagination: PaginationType,
        filters: ProductFilterDTO,
    ) -> OffsetResults[ProductOutDTO]:
        """Get filtered and paginated product results with caching."""

        cache_key_payload = {
            "filters": filters.model_dump(exclude_none=True),
            "pagination": pagination.model_dump(exclude_none=True),
            "out_dto_class": out_dto_class.__name__
        }
        sorted_payload_str = json.dumps(cache_key_payload, sort_keys=True)
        # Note: Python's hash() is not stable across Python processes or versions.
        # This is a simplification. Production should use a stable hash (e.g., hashlib).
        cache_key = f"product_filter:{hash(sorted_payload_str)}"

        target_cache_model = OffsetResults[out_dto_class]
        cached_results = await cache_manager.get(cache_key, target_cache_model)
        if cached_results:
            return cached_results

        query = sa.select(Product)
        query = self._apply_advanced_filters(query, filters)

        if isinstance(pagination, PaginationParamsSortBy) and pagination.sort_by:
            sort_by_list = [pagination.sort_by] if isinstance(pagination.sort_by, str) else pagination.sort_by
            sort_order_list = [pagination.sort_order] if isinstance(pagination.sort_order, str) else pagination.sort_order

            if len(sort_by_list) > 1 and len(sort_order_list) == 1:
                sort_order_list = sort_order_list * len(sort_by_list)

            for i, sort_field in enumerate(sort_by_list):
                current_sort_order = sort_order_list[i] if i < len(sort_order_list) else "desc"
                if hasattr(Product, sort_field):
                    query = self._apply_sort(query, sort_field, current_sort_order)
                else:
                    print(f"Warning: Invalid sort field '{sort_field}' for Product model. Using default sorting.")
                    query = self._apply_sort(query, "created_at", "desc")
                    break

        computed_pagination = await self._compute_offset_pagination(query)
        query = query.offset(pagination.offset).limit(pagination.limit)
        db_result = await self.session.execute(query)

        data_list = [out_dto_class.model_validate(row) for row in db_result.scalars()]
        results = OffsetResults[out_dto_class](data=data_list, pagination=computed_pagination) # Use generic type correctly

        await cache_manager.set(cache_key, results)
        return results
