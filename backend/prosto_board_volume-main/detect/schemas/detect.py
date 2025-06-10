from fastapi import UploadFile
from pydantic import BaseModel
from typing import List


class Detection_schema_input(BaseModel):
    file: UploadFile


class Point(BaseModel):
    x: float
    y: float


class Detection_Seg(BaseModel):
    """
    Модель данных для результатов обнаружения объекта.

    Атрибуты:
        confidence: Уверенность модели в обнаружении (0-1)
        class_name: Название класса обнаруженного объекта
        dots: Координаты точек
    """

    confidence: float
    class_name: str
    points: List[Point]
