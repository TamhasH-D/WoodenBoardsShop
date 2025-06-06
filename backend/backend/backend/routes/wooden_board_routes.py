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

router = APIRouter(prefix="/wooden-boards")

@router.post("/calculate-volume", status_code=200)
async def calculate_wooden_board_volume(
    image: UploadFile = File(...),
    height: float = 0.05,
    length: float = 1.0,
):
    """
    Calculate wooden board volume using YOLO image processing.

    This endpoint uses the unified WoodenBoardAnalysisService to eliminate code duplication
    and ensure consistent behavior across the application.

    Args:
        image: The uploaded image file
        height: Board height in meters (default: 0.05 = 5cm)
        length: Board length in meters (default: 1.0 = 100cm)

    Returns:
        Volume calculation results with detected boards
    """
    from backend.services.wooden_board_analysis_service import WoodenBoardAnalysisService

    analysis_service = WoodenBoardAnalysisService()
    result = await analysis_service.analyze_image(image, height, length)

    if result:
        return {
            "total_volume": result.total_volume,
            "total_count": result.total_count,
            "wooden_boards": [
                {
                    "volume": board.volume,
                    "height": board.height,
                    "width": board.width,
                    "length": board.length,
                    "detection": {
                        "confidence": board.detection.confidence,
                        "class_name": board.detection.class_name,
                        "points": board.detection.points
                    }
                }
                for board in result.wooden_boards
            ]
        }
    else:
        return {"total_volume": 0, "total_count": 0, "wooden_boards": []}


@router.post("/", status_code=201)
async def create_wooden_board(
    input_dto: WoodenBoardInputDTO,
    daos: GetDAOs,
) -> DataResponse[WoodenBoardDTO]:
    """Create a new WoodenBoard."""
    created_obj = await daos.wooden_board.create(input_dto)
    return DataResponse(data=WoodenBoardDTO.model_validate(created_obj))


@router.patch("/{wooden_board_id}", status_code=200)
async def update_wooden_board(
    wooden_board_id: UUID,
    update_dto: WoodenBoardUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update WoodenBoard."""
    await daos.wooden_board.update(wooden_board_id, update_dto)
    return EmptyResponse()


@router.delete("/{wooden_board_id}", status_code=204)
async def delete_wooden_board(
    wooden_board_id: UUID,
    daos: GetDAOs,
) -> None:
    """Delete a WoodenBoard by id."""
    await daos.wooden_board.delete(id=wooden_board_id)
    # HTTP 204 No Content must have empty body - no return statement needed


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
