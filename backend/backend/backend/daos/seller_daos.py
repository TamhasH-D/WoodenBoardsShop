from uuid import UUID
from typing import Type, TypeVar, Optional
from pydantic import BaseModel

from backend.daos.base_daos import BaseDAO
# Changed SellerOutDTO to SellerDTO
from backend.dtos.seller_dtos import SellerInputDTO, SellerUpdateDTO, SellerDTO
from backend.models.seller_models import Seller
from backend.cache_manager import cache_manager

# Define DTO TypeVar for use in this DAO, now bound to SellerDTO
_SellerDTO = TypeVar('_SellerDTO', bound=SellerDTO) # Renamed TypeVar and changed bound type


class SellerDAO(
    BaseDAO[
        Seller,
        SellerInputDTO,
        SellerUpdateDTO,
        SellerDTO, # Changed from SellerOutDTO to SellerDTO
    ]
):
    """Seller DAO."""

    async def get_by_keycloak_uuid(
        self,
        keycloak_uuid: UUID,
        out_dto_class: Type[_SellerDTO] # Use the renamed TypeVar
    ) -> Optional[_SellerDTO]: # Return type uses the renamed TypeVar
        """Get seller by keycloak_uuid with caching."""
        cache_key = f"Seller_keycloak:{keycloak_uuid}"

        # The out_dto_class parameter (which is _SellerDTO, effectively SellerDTO)
        # is passed to cache_manager.get for validation.
        cached_item = await cache_manager.get(cache_key, out_dto_class)
        if cached_item:
            return cached_item

        instance = await self.filter_first(keycloak_uuid=keycloak_uuid)

        if instance:
            dto_instance = out_dto_class.model_validate(instance)
            await cache_manager.set(cache_key, dto_instance)
            return dto_instance

        return None

    # Note: Invalidation for "Seller_keycloak:{keycloak_uuid}" cache entries
    # is not handled by BaseDAO's update/delete. If SellerDAO were to override
    # update or delete, it would be responsible for adding invalidation for this key.
    # This is a known limitation as per current subtask instructions.
