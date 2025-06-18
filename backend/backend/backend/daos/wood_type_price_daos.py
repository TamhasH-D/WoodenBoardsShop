from backend.daos.base_daos import BaseDAO
from backend.dtos.wood_type_price_dtos import (
    WoodTypePriceInputDTO,
    WoodTypePriceUpdateDTO,
    WoodTypePriceDTO, # Added WoodTypePriceDTO
)
from backend.models.wood_type_price_models import WoodTypePrice


class WoodTypePriceDAO(
    BaseDAO[
        WoodTypePrice,
        WoodTypePriceInputDTO,
        WoodTypePriceUpdateDTO,
        WoodTypePriceDTO, # Added WoodTypePriceDTO here
    ]
):
    """WoodTypePrice DAO."""
    pass # DAO can be empty if it only uses BaseDAO methods and no custom ones
