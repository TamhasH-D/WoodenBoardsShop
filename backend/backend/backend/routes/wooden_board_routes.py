from uuid import UUID

from fastapi import APIRouter

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.wooden_board_dtos import (
    WoodenBoardDTO,
    WoodenBoardInputDTO,
    WoodenBoardUpdateDTO,
)
from fastapi import UploadFile, File
import aiohttp

router = APIRouter(prefix="/wooden-boards")

@router.post("/calculate-volume", status_code=200)
async def calculate_wooden_board_volume(
    image: UploadFile = File(...),
    board_height: float = 0.0,
    board_length: float = 0.0,
):
    async with aiohttp.ClientSession() as session:
        form_data = aiohttp.FormData()
        form_data.add_field(
            "image",
            await image.read(),
            filename=image.filename,
            content_type=image.content_type,
        )
        form_data.add_field("board_height", str(board_height))
        form_data.add_field("board_length", str(board_length))

        from backend.settings import settings
        volume_service_url = settings.prosto_board_volume_seg_url

        async with session.post(volume_service_url, data=form_data) as response:
            response.raise_for_status()  # Raise an exception for HTTP errors
            return await response.json()


@router.post("/", status_code=201)
async def create_wooden_board(
    input_dto: WoodenBoardInputDTO,
    daos: GetDAOs,
) -> DataResponse[WoodenBoardDTO]:
    """Create a new WoodenBoard."""
    created_obj = await daos.wooden_board.create(input_dto)
    return DataResponse(data=WoodenBoardDTO.model_validate(created_obj))


@router.patch("/{wooden_board_id}")
async def update_wooden_board(
    wooden_board_id: UUID,
    update_dto: WoodenBoardUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update WoodenBoard."""
    await daos.wooden_board.update(wooden_board_id, update_dto)
    return EmptyResponse()


@router.delete("/{wooden_board_id}")
async def delete_wooden_board(
    wooden_board_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a WoodenBoard by id."""
    await daos.wooden_board.delete(id=wooden_board_id)
    return EmptyResponse()


@router.get("/")
async def get_wooden_board_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[WoodenBoardDTO]:
    """Get all WoodenBoards paginated."""
    return await daos.wooden_board.get_offset_results(
        out_dto=WoodenBoardDTO,
        pagination=pagination,
    )


@router.get("/{wooden_board_id}")
async def get_wooden_board(
    wooden_board_id: UUID,
    daos: GetDAOs,
) -> DataResponse[WoodenBoardDTO]:
    """Get a WoodenBoard by id."""
    wooden_board = await daos.wooden_board.filter_first(id=wooden_board_id)
    return DataResponse(data=WoodenBoardDTO.model_validate(wooden_board))
