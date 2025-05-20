from backend.daos.base_daos import BaseDAO
from backend.dtos.wood_type_price_dtos import (
    WoodTypePriceInputDTO,
    WoodTypePriceUpdateDTO,
)
from backend.models.wood_type_price_models import WoodTypePrice


class WoodTypePriceDAO(
    BaseDAO[
        WoodTypePrice,
        WoodTypePriceInputDTO,
        WoodTypePriceUpdateDTO,
    ]
):
    """WoodTypePrice DAO."""
