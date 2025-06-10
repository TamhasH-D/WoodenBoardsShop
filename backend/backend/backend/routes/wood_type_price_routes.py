from uuid import UUID

from fastapi import APIRouter

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.wood_type_price_dtos import (
    WoodTypePriceDTO,
    WoodTypePriceInputDTO,
    WoodTypePriceUpdateDTO,
)

router = APIRouter(prefix="/wood-type-prices")


@router.post("/", status_code=201)
async def create_wood_type_price(
    input_dto: WoodTypePriceInputDTO,
    daos: GetDAOs,
) -> DataResponse[WoodTypePriceDTO]:
    """Create a new WoodTypePrice."""
    created_obj = await daos.wood_type_price.create(input_dto)
    return DataResponse(data=WoodTypePriceDTO.model_validate(created_obj))


@router.patch("/{wood_type_price_id}")
async def update_wood_type_price(
    wood_type_price_id: UUID,
    update_dto: WoodTypePriceUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update WoodTypePrice."""
    await daos.wood_type_price.update(wood_type_price_id, update_dto)
    return EmptyResponse()


@router.delete("/{wood_type_price_id}")
async def delete_wood_type_price(
    wood_type_price_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a WoodTypePrice by id."""
    await daos.wood_type_price.delete(id=wood_type_price_id)
    return EmptyResponse()


@router.get("/")
async def get_wood_type_price_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[WoodTypePriceDTO]:
    """Get all WoodTypePrices paginated."""
    return await daos.wood_type_price.get_offset_results(
        out_dto=WoodTypePriceDTO,
        pagination=pagination,
    )


@router.get("/{wood_type_price_id}")
async def get_wood_type_price(
    wood_type_price_id: UUID,
    daos: GetDAOs,
) -> DataResponse[WoodTypePriceDTO]:
    """Get a WoodTypePrice by id."""
    wood_type_price = await daos.wood_type_price.filter_first(id=wood_type_price_id)
    return DataResponse(data=WoodTypePriceDTO.model_validate(wood_type_price))
