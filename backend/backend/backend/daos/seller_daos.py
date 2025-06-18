from uuid import UUID
from typing import Type, TypeVar, Optional # Added Type, TypeVar, Optional
from pydantic import BaseModel # Added BaseModel for OutDTO bound

from backend.daos.base_daos import BaseDAO
# Assuming SellerOutDTO exists for return types and BaseDAO's OutDTO
from backend.dtos.seller_dtos import SellerInputDTO, SellerUpdateDTO, SellerOutDTO
from backend.models.seller_models import Seller
from backend.cache_manager import cache_manager # Added

# Define OutDTO for use in this DAO, specific to Seller outputs
# This aligns with how BaseDAO is now structured.
_SellerOutDTO = TypeVar('_SellerOutDTO', bound=SellerOutDTO)


class SellerDAO(
    BaseDAO[
        Seller,
        SellerInputDTO,
        SellerUpdateDTO,
        SellerOutDTO, # Specified SellerOutDTO as the fourth generic type for BaseDAO
    ]
):
    """Seller DAO."""

    async def get_by_keycloak_uuid(
        self,
        keycloak_uuid: UUID,
        out_dto_class: Type[_SellerOutDTO] # Use the bound TypeVar for output DTO class
    ) -> Optional[_SellerOutDTO]:
        """Get seller by keycloak_uuid with caching."""
        cache_key = f"Seller_keycloak:{keycloak_uuid}"

        cached_item = await cache_manager.get(cache_key, out_dto_class)
        if cached_item:
            return cached_item

        # Cache miss, fetch from DB
        # filter_first returns a Model instance (Seller)
        instance = await self.filter_first(keycloak_uuid=keycloak_uuid)

        if instance:
            # Validate/convert to DTO
            dto_instance = out_dto_class.model_validate(instance)
            await cache_manager.set(cache_key, dto_instance)
            return dto_instance

        return None

    # Note: Invalidation for "Seller_keycloak:{keycloak_uuid}" cache entries
    # is not handled by BaseDAO's update/delete. If SellerDAO were to override
    # update or delete, it would be responsible for adding invalidation for this key.
    # This is a known limitation as per current subtask instructions.
