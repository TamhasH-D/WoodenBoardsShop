from backend.daos.base_daos import BaseDAO
from backend.dtos.seller_dtos import SellerInputDTO, SellerUpdateDTO
from backend.models.seller_models import Seller


class SellerDAO(
    BaseDAO[
        Seller,
        SellerInputDTO,
        SellerUpdateDTO,
    ]
):
    """Seller DAO."""
