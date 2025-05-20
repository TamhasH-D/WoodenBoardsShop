from backend.daos.base_daos import BaseDAO
from backend.dtos.buyer_dtos import BuyerInputDTO, BuyerUpdateDTO
from backend.models.buyer_models import Buyer


class BuyerDAO(
    BaseDAO[
        Buyer,
        BuyerInputDTO,
        BuyerUpdateDTO,
    ]
):
    """Buyer DAO."""
