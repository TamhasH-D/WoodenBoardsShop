from backend.daos.base_daos import BaseDAO
from backend.dtos.wooden_board_dtos import WoodenBoardInputDTO, WoodenBoardUpdateDTO
from backend.models.wooden_board_models import WoodenBoard


class WoodenBoardDAO(
    BaseDAO[
        WoodenBoard,
        WoodenBoardInputDTO,
        WoodenBoardUpdateDTO,
    ]
):
    """WoodenBoard DAO."""
