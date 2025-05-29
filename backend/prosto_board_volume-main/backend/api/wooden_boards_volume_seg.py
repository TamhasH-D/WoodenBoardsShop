from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, List
from PIL import Image
import aiohttp
import io
import numpy as np
import cv2
import math
from pydantic import parse_obj_as

from core.settings import settings
from core.logging_config import setup_logger
from schemas.detect import Detection_Seg, Point
from schemas.wooden_boards_detect import (
    Wooden_boards_seg_schema_input,
    Wooden_boards_seg_schema_output,
    Wooden_board_seg,
)

router = APIRouter()
logger = setup_logger("wooden_boards_volume_seg")


def optimize_quad_points(points_array: np.ndarray) -> np.ndarray:
    """
    Transforms an arbitrary set of points into the optimal 4 corner points.
    This function uses multiple strategies to ensure reliable corner detection
    regardless of the input complexity.
    
    Args:
        points_array: Numpy array of shape (n, 2) containing n points
        
    Returns:
        Numpy array of shape (4, 2) containing the optimal 4 corner points
    """
    # If we already have exactly 4 points, return them
    if len(points_array) == 4:
        return points_array
    
    # Reshape for OpenCV functions if needed
    points_reshaped = points_array.reshape(-1, 1, 2).astype(np.float32)
    
    # Strategy 1: Progressive contour approximation
    perimeter = cv2.arcLength(points_reshaped, True)
    
    # Try a range of epsilon values to get exactly 4 points
    for eps_factor in np.linspace(0.01, 0.2, 20):
        epsilon = eps_factor * perimeter
        approx = cv2.approxPolyDP(points_reshaped, epsilon, True)
        if len(approx) == 4:
            return approx.reshape(-1, 2)
    
    # Strategy 2: Convex hull method
    hull = cv2.convexHull(points_reshaped)
    hull_perimeter = cv2.arcLength(hull, True)
    
    for eps_factor in np.linspace(0.01, 0.2, 20):
        epsilon = eps_factor * hull_perimeter
        approx = cv2.approxPolyDP(hull, epsilon, True)
        if len(approx) == 4:
            return approx.reshape(-1, 2)
    
    # Strategy 3: Minimum area bounding rectangle
    # This always returns 4 points, so it's our final fallback
    rect = cv2.minAreaRect(points_reshaped)
    box = cv2.boxPoints(rect)
    
    logger.debug("Using minimum area rectangle as fallback for point optimization")
    return box


def order_points_consistently(points: np.ndarray) -> np.ndarray:
    """
    Orders points in a consistent manner (clockwise from top-left).
    This approach works reliably regardless of the quadrilateral's orientation.
    
    Args:
        points: Numpy array of shape (4, 2) containing 4 points
        
    Returns:
        Ordered points in clockwise sequence
    """
    # Calculate centroid of the quadrilateral
    centroid = np.mean(points, axis=0)
    
    # Calculate angles between centroid and each point
    angles = np.arctan2(points[:, 1] - centroid[1], points[:, 0] - centroid[0])
    
    # Sort points by angle in clockwise order
    sorted_indices = np.argsort(angles)
    ordered = points[sorted_indices]
    
    # Ensure we start from the "top-left" equivalent point
    # (the point with the smallest sum of x and y coordinates)
    sums = np.sum(ordered, axis=1)
    min_sum_idx = np.argmin(sums)
    
    # Rotate points to start from the min_sum_idx
    ordered = np.roll(ordered, -min_sum_idx, axis=0)
    
    return ordered


def calculate_timber_dimensions(quadrilateral_points: List[dict], input_height: float) -> tuple:
    """
    Calculates the dimensions of a timber board based on the quadrilateral points.
    
    Args:
        quadrilateral_points: List of points {x, y} defining the corners of the timber
        input_height: Reference height in real-world units
        
    Returns:
        tuple of (width, height, ratio)
    """
    # Calculate side lengths
    sides = []
    for i in range(4):
        p1 = quadrilateral_points[i]
        p2 = quadrilateral_points[(i + 1) % 4]
        side_length = math.sqrt((p2["x"] - p1["x"]) ** 2 + (p2["y"] - p1["y"]) ** 2)
        sides.append(side_length)
    
    # Average opposite sides
    width = (sides[0] + sides[2]) / 2
    height = (sides[1] + sides[3]) / 2
    
    # If width < height, swap them (for consistent orientation)
    if width < height:
        width, height = height, width
    
    # Calculate scaling ratio
    ratio = input_height / height
    
    return width, height, ratio


@router.post("/wooden_boards_volume_seg/")
async def wooden_boards_volume(
    input: Annotated[Wooden_boards_seg_schema_input, Depends()],
) -> Wooden_boards_seg_schema_output:
    """
    Process image to detect and calculate the volume of wooden boards.
    
    Args:
        input: Input schema containing image, board height, and board length
        
    Returns:
        Schema with detection results, volumes, and dimensions
    """
    logger.info(f"Начало обработки изображения с сегментацией: {input.image.filename}")
    
    try:
        # Read the uploaded image
        image_bytes = await input.image.read()
        
        # Validate image format
        Image.open(io.BytesIO(image_bytes))
        
        # Send image to YOLO detection service
        async with aiohttp.ClientSession() as session:
            form_data = aiohttp.FormData()
            form_data.add_field(
                "file",
                image_bytes,
                filename=input.image.filename,
                content_type=input.image.content_type,
            )
            
            async with session.post(settings.YOLO_SERVICE_SEGMENT_URL, data=form_data) as response:
                if response.status != 200:
                    error_message = await response.text()
                    logger.error(f"Ошибка сервиса Wood_detection_seg: {error_message}")
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"Ошибка от Wood_detection: {error_message}",
                    )
                
                detection_results_raw = await response.json()
                logger.debug("Получен ответ от сервиса сегментации")
                
                try:
                    detection_results = parse_obj_as(List[Detection_Seg], detection_results_raw)
                    logger.info(f"Успешно обработано {len(detection_results)} результатов сегментации")
                except Exception as e:
                    logger.error(f"Ошибка валидации результатов сегментации: {str(e)}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Validation error: {e}",
                    )
        
        total_volume = 0
        detections = []
        
        for detection in detection_results:
            if detection.confidence < settings.CONFIDENCE_THRESHOLD:
                logger.debug(f"Пропущено обнаружение с уверенностью {detection.confidence} < {settings.CONFIDENCE_THRESHOLD}")
                continue
            
            if detection.class_name != "wood":
                logger.debug(f"Пропущено обнаружение с классом {detection.class_name}")
                continue
            # Convert detection points to numpy array
            points_array = np.array([(point.x, point.y) for point in detection.points], dtype=np.float32)
            
            # Optimize to get exactly 4 corner points
            optimized_points = optimize_quad_points(points_array)
            
            # Order points consistently
            ordered_points = order_points_consistently(optimized_points)
            
            # Convert points back to dictionary format
            quad_points = [{"x": float(p[0]), "y": float(p[1])} for p in ordered_points]
            
            # Calculate dimensions and volume
            width_px, height_px, ratio = calculate_timber_dimensions(quad_points, input.height)
            
            # Real-world dimensions
            width_real = width_px * ratio
            height_real = height_px * ratio
            
            # Calculate volume
            volume = width_real * height_real * input.length
            
            # Format points for output
            output_points = [Point(x=p["x"], y=p["y"]) for p in quad_points]
            
            # Create detection result
            result_detection = Detection_Seg(
                confidence=detection.confidence,
                class_name=detection.class_name,
                points=output_points,
            )
            
            # Add to results
            detections.append(
                Wooden_board_seg(
                    volume=volume,
                    height=height_real,
                    width=width_real,
                    length=input.length,
                    detection=result_detection,
                )
            )
            
            total_volume += volume
        
        # Create final output
        result = Wooden_boards_seg_schema_output(
            total_volume=total_volume,
            total_count=len(detections),
            wooden_boards=detections,
        )
        
        logger.info(
            f"Завершена обработка изображения {input.image.filename}. "
            f"Обработано досок: {result.total_count}, "
            f"Общий объем: {result.total_volume:.2f}."
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Неожиданная ошибка при обработке изображения: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка обработки: {str(e)}",
        )
