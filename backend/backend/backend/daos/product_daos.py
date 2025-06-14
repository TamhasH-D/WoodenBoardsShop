from typing import Any, Union
from uuid import UUID

import sqlalchemy as sa
from pydantic import BaseModel

from backend.daos.base_daos import BaseDAO, PaginationType
from backend.dtos import OffsetPaginationMetadata, OffsetResults, PaginationParamsSortBy
from backend.dtos.product_dtos import ProductFilterDTO, ProductInputDTO, ProductUpdateDTO
from backend.models.product_models import Product


class ProductDAO(
    BaseDAO[
        Product,
        ProductInputDTO,
        ProductUpdateDTO,
    ]
):
    """Product DAO."""

    def _apply_advanced_filters(
        self,
        query: sa.Select[tuple[Product]],
        filters: ProductFilterDTO,
    ) -> sa.Select[tuple[Product]]:
        """Apply advanced filters to the query."""

        # Text search in title and description
        if filters.search_query:
            search_term = f"%{filters.search_query.lower()}%"
            query = query.filter(
                sa.or_(
                    sa.func.lower(Product.title).like(search_term),
                    sa.func.lower(Product.descrioption).like(search_term)
                )
            )

        # Price range filters
        if filters.price_min is not None:
            query = query.filter(Product.price >= filters.price_min)
        if filters.price_max is not None:
            query = query.filter(Product.price <= filters.price_max)

        # Volume range filters
        if filters.volume_min is not None:
            query = query.filter(Product.volume >= filters.volume_min)
        if filters.volume_max is not None:
            query = query.filter(Product.volume <= filters.volume_max)

        # Multiple selection filters
        if filters.wood_type_ids:
            query = query.filter(Product.wood_type_id.in_(filters.wood_type_ids))
        if filters.seller_ids:
            query = query.filter(Product.seller_id.in_(filters.seller_ids))

        # Boolean filters
        if filters.delivery_possible is not None:
            query = query.filter(Product.delivery_possible == filters.delivery_possible)
        if filters.has_pickup_location is not None:
            if filters.has_pickup_location:
                query = query.filter(Product.pickup_location.isnot(None))
            else:
                query = query.filter(Product.pickup_location.is_(None))

        # Date range filters
        if filters.created_after is not None:
            query = query.filter(Product.created_at >= filters.created_after)
        if filters.created_before is not None:
            query = query.filter(Product.created_at <= filters.created_before)

        return query

    async def get_filtered_results(
        self,
        out_dto: type[BaseModel],
        pagination: PaginationType,
        filters: ProductFilterDTO,
    ) -> OffsetResults[BaseModel]:
        """Get filtered and paginated product results."""

        # Start with base query
        query = sa.select(Product)

        # Apply advanced filters
        query = self._apply_advanced_filters(query, filters)

        # Apply sorting BEFORE pagination if provided
        if isinstance(pagination, PaginationParamsSortBy) and pagination.sort_by:
            # Handle both string and list sort_by
            sort_by = pagination.sort_by if isinstance(pagination.sort_by, str) else pagination.sort_by[0]
            sort_order = pagination.sort_order if isinstance(pagination.sort_order, str) else pagination.sort_order[0]

            # Validate sort_by field exists on Product model
            if hasattr(Product, sort_by):
                query = self._apply_sort(query, sort_by, sort_order)
            else:
                # Log warning but don't fail - use default sorting
                print(f"Warning: Invalid sort field '{sort_by}' for Product model. Using default sorting.")
                query = self._apply_sort(query, "created_at", "desc")

        # Compute pagination metadata before applying pagination
        computed_pagination = await self._compute_offset_pagination(query)

        # Apply pagination AFTER sorting
        query = query.offset(pagination.offset).limit(pagination.limit)

        # Execute query
        result = await self.session.execute(query)

        return OffsetResults(
            data=[out_dto.model_validate(row) for row in result.scalars()],
            pagination=computed_pagination,
        )
