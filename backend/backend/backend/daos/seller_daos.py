from uuid import UUID

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

    async def get_by_keycloak_uuid(self, keycloak_uuid: UUID) -> Seller | None:
        """Get seller by keycloak_uuid."""
        return await self.filter_first(keycloak_uuid=keycloak_uuid)
