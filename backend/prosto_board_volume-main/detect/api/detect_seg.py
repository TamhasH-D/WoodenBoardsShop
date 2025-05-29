from fastapi import APIRouter, Depends
from PIL import Image
import io
from typing import List, Annotated
from ultralytics import YOLO

from schemas.detect import Detection_schema_input, Detection_Seg, Point
from core.settings import settings

router = APIRouter()
model_seg = YOLO(settings.PATH_TO_YOLO_SEGMENT_MODEL)


@router.post("/detect_seg/")
async def detect_seg(
    input: Annotated[Detection_schema_input, Depends()],
) -> List[Detection_Seg]:
    """
    Конечная точка для обнаружения объектов с сегментацией на изображении.

    Параметры:
        file: Загруженное изображение для анализа

    Возвращает:
        List[Detection_Seg]: Список обнаруженных объектов с сегментационными точками, уверенностью модели и именем класса
    """

    # Чтение и преобразование загруженного файла в формат PIL Image
    image_bytes = await input.file.read()
    image = Image.open(io.BytesIO(image_bytes))

    # Запуск модели YOLOv8 с поддержкой сегментации
    results = model_seg(image)

    # Преобразование результатов обнаружения в структурированный формат
    detections = []
    for result in results:
        if result.masks is not None:
            for conf, cls_id, seg in zip(
                result.boxes.conf, result.boxes.cls, result.masks.xy
            ):
                # Преобразование результатов сегментации в список точек с масштабированием координат к размерам изображения

                points = []

                for point in seg:
                    points.append(
                        Point(
                            x=point[0],
                            y=point[1],
                        )
                    )
                detection = Detection_Seg(
                    confidence=float(conf),
                    class_name=result.names[int(cls_id)],
                    points=points,
                )
                detections.append(detection)

    return detections
