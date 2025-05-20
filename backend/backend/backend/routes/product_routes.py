from uuid import UUID

from fastapi import APIRouter

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.product_dtos import ProductDTO, ProductInputDTO, ProductUpdateDTO

router = APIRouter(prefix="/products")


@router.post("/", status_code=201)
async def create_product(
    input_dto: ProductInputDTO,
    daos: GetDAOs,
) -> DataResponse[ProductDTO]:
    """Create a new Product."""
    created_obj = await daos.product.create(input_dto)
    return DataResponse(data=ProductDTO.model_validate(created_obj))


@router.patch("/{product_id}")
async def update_product(
    product_id: UUID,
    update_dto: ProductUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update Product."""
    await daos.product.update(product_id, update_dto)
    return EmptyResponse()


@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a Product by id."""
    await daos.product.delete(id=product_id)
    return EmptyResponse()


@router.get("/")
async def get_product_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[ProductDTO]:
    """Get all Products paginated."""
    return await daos.product.get_offset_results(
        out_dto=ProductDTO,
        pagination=pagination,
    )


@router.get("/{product_id}")
async def get_product(
    product_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ProductDTO]:
    """Get a Product by id."""
    product = await daos.product.filter_first(id=product_id)
    return DataResponse(data=ProductDTO.model_validate(product))
