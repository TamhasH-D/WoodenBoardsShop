from uuid import UUID

from fastapi import APIRouter

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.wood_type_dtos import WoodTypeDTO, WoodTypeInputDTO, WoodTypeUpdateDTO

router = APIRouter(prefix="/wood-types")


@router.post("/", status_code=201)
async def create_wood_type(
    input_dto: WoodTypeInputDTO,
    daos: GetDAOs,
) -> DataResponse[WoodTypeDTO]:
    """Create a new WoodType."""
    created_obj = await daos.wood_type.create(input_dto)
    return DataResponse(data=WoodTypeDTO.model_validate(created_obj))


@router.patch("/{wood_type_id}")
async def update_wood_type(
    wood_type_id: UUID,
    update_dto: WoodTypeUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update WoodType."""
    await daos.wood_type.update(wood_type_id, update_dto)
    return EmptyResponse()


@router.delete("/{wood_type_id}")
async def delete_wood_type(
    wood_type_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a WoodType by id."""
    await daos.wood_type.delete(id=wood_type_id)
    return EmptyResponse()


@router.get("/")
async def get_wood_type_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[WoodTypeDTO]:
    """Get all WoodTypes paginated."""
    return await daos.wood_type.get_offset_results(
        out_dto=WoodTypeDTO,
        pagination=pagination,
    )


@router.get("/{wood_type_id}")
async def get_wood_type(
    wood_type_id: UUID,
    daos: GetDAOs,
) -> DataResponse[WoodTypeDTO]:
    """Get a WoodType by id."""
    wood_type = await daos.wood_type.filter_first(id=wood_type_id)
    return DataResponse(data=WoodTypeDTO.model_validate(wood_type))
