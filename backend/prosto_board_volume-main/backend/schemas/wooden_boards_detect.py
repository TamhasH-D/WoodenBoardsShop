from typing import List
from fastapi import UploadFile
from pydantic import BaseModel

from schemas.detect import Detection_Seg


class Wooden_boards_seg_schema_input(BaseModel):
    image: UploadFile
    height: float = 5
    length: float = 100


class Wooden_board_seg(BaseModel):
    volume: float
    height: float
    width: float
    length: float
    detection: Detection_Seg


class Wooden_boards_seg_schema_output(BaseModel):
    total_volume: float
    total_count: int
    wooden_boards: List[Wooden_board_seg]
