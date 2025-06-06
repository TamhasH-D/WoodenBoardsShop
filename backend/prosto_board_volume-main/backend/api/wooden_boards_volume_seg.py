from fastapi import APIRouter, Depends, HTTPException
from typing import Annotated, List
from PIL import Image
import aiohttp
import io
import json
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
        input_height: Reference height in real-world units (meters)

    Returns:
        tuple of (width, height, ratio)
    """
    # Validate input
    if len(quadrilateral_points) != 4:
        raise ValueError(f"Expected 4 points, got {len(quadrilateral_points)}")

    if input_height <= 0:
        raise ValueError(f"Input height must be positive, got {input_height}")

    logger.debug(f"Расчет размеров для точек: {quadrilateral_points}")
    logger.debug(f"Входная высота: {input_height} м")

    # Calculate side lengths
    sides = []
    for i in range(4):
        p1 = quadrilateral_points[i]
        p2 = quadrilateral_points[(i + 1) % 4]
        side_length = math.sqrt((p2["x"] - p1["x"]) ** 2 + (p2["y"] - p1["y"]) ** 2)
        sides.append(side_length)
        logger.debug(f"Сторона {i}: от ({p1['x']:.2f}, {p1['y']:.2f}) до ({p2['x']:.2f}, {p2['y']:.2f}) = {side_length:.2f} пикселей")

    # Validate that we have valid side lengths
    if any(side <= 0 for side in sides):
        raise ValueError(f"Invalid side lengths: {sides}")

    logger.debug(f"Длины сторон: {[f'{s:.2f}' for s in sides]}")

    # Average opposite sides
    width = (sides[0] + sides[2]) / 2
    height = (sides[1] + sides[3]) / 2

    logger.debug(f"Средние размеры: ширина={(sides[0] + sides[2])/2:.2f}, высота={(sides[1] + sides[3])/2:.2f}")

    # Validate dimensions
    if width <= 0 or height <= 0:
        raise ValueError(f"Invalid dimensions: width={width}, height={height}")

    # If width < height, swap them (for consistent orientation)
    original_width, original_height = width, height
    if width < height:
        width, height = height, width
        logger.debug(f"Поменяли местами размеры: {original_width:.2f} x {original_height:.2f} -> {width:.2f} x {height:.2f}")

    # Calculate scaling ratio with validation
    if height <= 0:
        raise ValueError(f"Height in pixels must be positive, got {height}")

    ratio = input_height / height
    logger.debug(f"Коэффициент масштабирования: {input_height} / {height:.2f} = {ratio:.6f}")

    # Validate ratio
    if ratio <= 0 or not math.isfinite(ratio):
        raise ValueError(f"Invalid scaling ratio: {ratio}")

    logger.debug(f"Финальные размеры: ширина={width:.2f}px, высота={height:.2f}px, коэффициент={ratio:.6f}")

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
        logger.info(f"Отправка запроса к сервису сегментации: {settings.YOLO_SERVICE_SEGMENT_URL}")
        logger.info(f"Размер изображения: {len(image_bytes)} байт")

        async with aiohttp.ClientSession() as session:
            form_data = aiohttp.FormData()
            form_data.add_field(
                "file",
                image_bytes,
                filename=input.image.filename,
                content_type=input.image.content_type,
            )

            try:
                async with session.post(settings.YOLO_SERVICE_SEGMENT_URL, data=form_data) as response:
                    logger.info(f"Получен ответ от сервиса сегментации: HTTP {response.status}")

                    if response.status != 200:
                        error_message = await response.text()
                        logger.error(f"Ошибка сервиса Wood_detection_seg: HTTP {response.status} - {error_message}")
                        raise HTTPException(
                            status_code=response.status,
                            detail=f"Ошибка от Wood_detection: {error_message}",
                        )

                    # Get response text first for debugging
                    response_text = await response.text()
                    logger.debug(f"Сырой ответ от сервиса сегментации: {response_text[:500]}...")

                    # Parse JSON
                    try:
                        detection_results_raw = json.loads(response_text)
                        logger.info(f"JSON успешно распарсен, тип: {type(detection_results_raw)}")

                        if isinstance(detection_results_raw, list):
                            logger.info(f"Получен список из {len(detection_results_raw)} элементов")
                        else:
                            logger.warning(f"Ожидался список, получен: {type(detection_results_raw)}")

                    except json.JSONDecodeError as e:
                        logger.error(f"Ошибка парсинга JSON: {str(e)}")
                        logger.error(f"Проблемный ответ: {response_text}")
                        raise HTTPException(
                            status_code=500,
                            detail=f"Invalid JSON response from detection service: {e}",
                        )

                    # Validate response structure
                    try:
                        detection_results = parse_obj_as(List[Detection_Seg], detection_results_raw)
                        logger.info(f"Успешно обработано {len(detection_results)} результатов сегментации")

                        # Log details about each detection
                        for i, detection in enumerate(detection_results):
                            logger.debug(f"Обнаружение {i}: класс={detection.class_name}, уверенность={detection.confidence}, точек={len(detection.points)}")

                    except Exception as e:
                        logger.error(f"Ошибка валидации результатов сегментации: {str(e)}")
                        logger.error(f"Проблемные данные: {detection_results_raw}")
                        raise HTTPException(
                            status_code=500,
                            detail=f"Validation error: {e}",
                        )

            except aiohttp.ClientError as e:
                logger.error(f"Ошибка сетевого соединения с сервисом сегментации: {str(e)}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Cannot connect to detection service: {e}",
                )
        
        total_volume = 0
        detections = []

        logger.info(f"Начинаем обработку {len(detection_results)} результатов сегментации")
        logger.info(f"Порог уверенности: {settings.CONFIDENCE_THRESHOLD}")
        logger.info(f"Входные параметры: высота={input.height}м, длина={input.length}м")

        # Collect statistics for debugging
        confidence_stats = [d.confidence for d in detection_results]
        class_stats = [d.class_name for d in detection_results]

        if confidence_stats:
            logger.info(f"Статистика уверенности: мин={min(confidence_stats):.3f}, макс={max(confidence_stats):.3f}, среднее={sum(confidence_stats)/len(confidence_stats):.3f}")

        if class_stats:
            unique_classes = set(class_stats)
            logger.info(f"Найденные классы: {unique_classes}")
            for class_name in unique_classes:
                count = class_stats.count(class_name)
                logger.info(f"  Класс '{class_name}': {count} обнаружений")

        for i, detection in enumerate(detection_results):
            logger.debug(f"Обрабатываем обнаружение {i}: класс={detection.class_name}, уверенность={detection.confidence}")

            if detection.confidence < settings.CONFIDENCE_THRESHOLD:
                logger.debug(f"Пропущено обнаружение {i} с уверенностью {detection.confidence} < {settings.CONFIDENCE_THRESHOLD}")
                continue

            # More flexible class name matching
            valid_class_names = ["wood", "wooden", "board", "timber", "lumber"]
            if detection.class_name.lower() not in valid_class_names:
                logger.debug(f"Пропущено обнаружение {i} с классом '{detection.class_name}' (ожидается один из: {valid_class_names})")
                continue

            logger.info(f"Обрабатываем валидное обнаружение {i}: класс={detection.class_name}, уверенность={detection.confidence}, точек={len(detection.points)}")
            # Convert detection points to numpy array
            try:
                points_array = np.array([(point.x, point.y) for point in detection.points], dtype=np.float32)
                logger.debug(f"Обнаружение {i}: исходных точек={len(detection.points)}")

                # Optimize to get exactly 4 corner points
                optimized_points = optimize_quad_points(points_array)
                logger.debug(f"Обнаружение {i}: оптимизированных точек={len(optimized_points)}")

                # Order points consistently
                ordered_points = order_points_consistently(optimized_points)
                logger.debug(f"Обнаружение {i}: упорядоченных точек={len(ordered_points)}")

                # Convert points back to dictionary format
                quad_points = [{"x": float(p[0]), "y": float(p[1])} for p in ordered_points]

                # Log detailed point information
                logger.debug(f"Обнаружение {i}: четырехугольные точки: {quad_points}")

                # Calculate dimensions and volume
                width_px, height_px, ratio = calculate_timber_dimensions(quad_points, input.height)
                logger.info(f"Обнаружение {i}: размеры в пикселях - ширина={width_px:.2f}, высота={height_px:.2f}, коэффициент={ratio:.6f}")

                # Real-world dimensions
                width_real = width_px * ratio
                height_real = height_px * ratio
                logger.info(f"Обнаружение {i}: реальные размеры - ширина={width_real:.6f}м, высота={height_real:.6f}м")

                # Calculate volume
                volume = width_real * height_real * input.length
                logger.info(f"Обнаружение {i}: рассчитанный объем={volume:.8f} м³")
                logger.info(f"  Формула: {width_real:.6f} × {height_real:.6f} × {input.length} = {volume:.8f}")

                # Enhanced validation with detailed logging
                if volume <= 0:
                    logger.warning(f"Обнаружение {i}: объем <= 0 ({volume}), пропускаем")
                    logger.warning(f"  Детали: width_real={width_real}, height_real={height_real}, length={input.length}")
                    continue

                if width_real <= 0 or height_real <= 0:
                    logger.warning(f"Обнаружение {i}: недопустимые размеры (ширина={width_real}, высота={height_real}), пропускаем")
                    continue

                # Additional sanity checks
                if width_real > 10 or height_real > 10:  # Boards larger than 10m seem unrealistic
                    logger.warning(f"Обнаружение {i}: подозрительно большие размеры (ширина={width_real}м, высота={height_real}м), но продолжаем")

                if volume > 100:  # Volume larger than 100 m³ seems unrealistic for a single board
                    logger.warning(f"Обнаружение {i}: подозрительно большой объем ({volume:.6f} м³), но продолжаем")

            except Exception as calc_error:
                logger.error(f"Ошибка при расчете объема для обнаружения {i}: {str(calc_error)}")
                continue
            
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
            logger.debug(f"Добавлен объем {volume:.6f}, общий объем теперь: {total_volume:.6f}")

        # Create final output
        logger.info(f"Создаем финальный результат: досок={len(detections)}, общий_объем={total_volume:.6f}")

        result = Wooden_boards_seg_schema_output(
            total_volume=total_volume,
            total_count=len(detections),
            wooden_boards=detections,
        )

        # Validate final result
        logger.info(f"Финальный результат создан: total_volume={result.total_volume}, total_count={result.total_count}, boards_count={len(result.wooden_boards)}")

        # Additional validation
        if result.total_volume == 0 and len(detection_results) > 0:
            logger.warning("ВНИМАНИЕ: Общий объем равен 0, но были обнаружения от сервиса сегментации!")
            logger.warning(f"Исходных обнаружений: {len(detection_results)}")
            logger.warning(f"Обработанных досок: {len(detections)}")

        logger.info(
            f"Завершена обработка изображения {input.image.filename}. "
            f"Обработано досок: {result.total_count}, "
            f"Общий объем: {result.total_volume:.6f} м³."
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Неожиданная ошибка при обработке изображения: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка обработки: {str(e)}",
        )
