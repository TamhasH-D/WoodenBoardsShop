from uuid import UUID

from fastapi import APIRouter

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.image_dtos import ImageDTO, ImageInputDTO, ImageUpdateDTO

router = APIRouter(prefix="/images")


@router.post("/", status_code=201)
async def create_image(
    input_dto: ImageInputDTO,
    daos: GetDAOs,
) -> DataResponse[ImageDTO]:
    """Create a new Image."""
    created_obj = await daos.image.create(input_dto)
    return DataResponse(data=ImageDTO.model_validate(created_obj))


@router.patch("/{image_id}")
async def update_image(
    image_id: UUID,
    update_dto: ImageUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update Image."""
    await daos.image.update(image_id, update_dto)
    return EmptyResponse()


@router.delete("/{image_id}")
async def delete_image(
    image_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a Image by id."""
    await daos.image.delete(id=image_id)
    return EmptyResponse()


@router.get("/")
async def get_image_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[ImageDTO]:
    """Get all Images paginated."""
    return await daos.image.get_offset_results(
        out_dto=ImageDTO,
        pagination=pagination,
    )


@router.get("/{image_id}")
async def get_image(
    image_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ImageDTO]:
    """Get a Image by id."""
    image = await daos.image.filter_first(id=image_id)
    return DataResponse(data=ImageDTO.model_validate(image))
