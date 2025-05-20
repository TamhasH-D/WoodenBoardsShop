from backend.daos.base_daos import BaseDAO
from backend.dtos.product_dtos import ProductInputDTO, ProductUpdateDTO
from backend.models.product_models import Product


class ProductDAO(
    BaseDAO[
        Product,
        ProductInputDTO,
        ProductUpdateDTO,
    ]
):
    """Product DAO."""
