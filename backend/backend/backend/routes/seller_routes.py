from uuid import UUID

from fastapi import APIRouter

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.seller_dtos import SellerDTO, SellerInputDTO, SellerUpdateDTO

router = APIRouter(prefix="/sellers")


@router.post("/", status_code=201)
async def create_seller(
    input_dto: SellerInputDTO,
    daos: GetDAOs,
) -> DataResponse[SellerDTO]:
    """Create a new Seller."""
    created_obj = await daos.seller.create(input_dto)
    return DataResponse(data=SellerDTO.model_validate(created_obj))


@router.patch("/{seller_id}")
async def update_seller(
    seller_id: UUID,
    update_dto: SellerUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update Seller."""
    await daos.seller.update(seller_id, update_dto)
    return EmptyResponse()


@router.delete("/{seller_id}")
async def delete_seller(
    seller_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a Seller by id."""
    await daos.seller.delete(id=seller_id)
    return EmptyResponse()


@router.get("/")
async def get_seller_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[SellerDTO]:
    """Get all Sellers paginated."""
    return await daos.seller.get_offset_results(
        out_dto=SellerDTO,
        pagination=pagination,
    )


@router.get("/{seller_id}")
async def get_seller(
    seller_id: UUID,
    daos: GetDAOs,
) -> DataResponse[SellerDTO]:
    """Get a Seller by id."""
    seller = await daos.seller.filter_first(id=seller_id)
    return DataResponse(data=SellerDTO.model_validate(seller))
