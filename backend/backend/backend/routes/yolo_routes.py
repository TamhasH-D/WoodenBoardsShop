from fastapi import APIRouter, UploadFile, File

router = APIRouter()


@router.post("/wooden_boards_volume_seg/", status_code=200)
async def wooden_boards_volume_seg(
    image: UploadFile = File(...),
    height: float = 0.05,
    length: float = 1.0,
):
    """
    Direct endpoint for wooden boards volume segmentation processing.
    This endpoint matches the frontend expectation for /wooden_boards_volume_seg/

    Uses the unified WoodenBoardAnalysisService to eliminate code duplication
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
