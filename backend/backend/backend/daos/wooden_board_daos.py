from backend.daos.base_daos import BaseDAO
from backend.dtos.wooden_board_dtos import WoodenBoardInputDTO, WoodenBoardUpdateDTO, WoodenBoardDTO # Added WoodenBoardDTO
from backend.models.wooden_board_models import WoodenBoard


class WoodenBoardDAO(
    BaseDAO[
        WoodenBoard,
        WoodenBoardInputDTO,
        WoodenBoardUpdateDTO,
        WoodenBoardDTO, # Added WoodenBoardDTO here
    ]
):
    """WoodenBoard DAO."""
    pass # DAO can be empty if it only uses BaseDAO methods and no custom ones
