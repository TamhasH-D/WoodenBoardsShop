from uuid import UUID

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

    async def get_by_keycloak_uuid(self, keycloak_uuid: UUID) -> Buyer | None:
        """Get buyer by keycloak_uuid."""
        return await self.filter_first(keycloak_uuid=keycloak_uuid)
