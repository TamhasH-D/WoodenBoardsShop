from backend.daos.base_daos import BaseDAO
from backend.dtos.wood_type_dtos import WoodTypeInputDTO, WoodTypeUpdateDTO
from backend.models.wood_type_models import WoodType


class WoodTypeDAO(
    BaseDAO[
        WoodType,
        WoodTypeInputDTO,
        WoodTypeUpdateDTO,
    ]
):
    """WoodType DAO."""
