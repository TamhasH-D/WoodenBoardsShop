from uuid import UUID
from typing import Type, TypeVar, Optional
from pydantic import BaseModel

from backend.daos.base_daos import BaseDAO
# Changed BuyerOutDTO to BuyerDTO
from backend.dtos.buyer_dtos import BuyerInputDTO, BuyerUpdateDTO, BuyerDTO
from backend.models.buyer_models import Buyer
from backend.cache_manager import cache_manager

# Define OutDTO for use in this DAO, specific to Buyer outputs, now bound to BuyerDTO
_BuyerDTO = TypeVar('_BuyerDTO', bound=BuyerDTO) # Renamed TypeVar and changed bound type


class BuyerDAO(
    BaseDAO[
        Buyer,
        BuyerInputDTO,
        BuyerUpdateDTO,
        BuyerDTO, # Changed from BuyerOutDTO to BuyerDTO
    ]
):
    """Buyer DAO."""

    async def get_by_keycloak_uuid(
        self,
        keycloak_uuid: UUID,
        out_dto_class: Type[_BuyerDTO] # Use the renamed TypeVar
    ) -> Optional[_BuyerDTO]: # Return type uses the renamed TypeVar
        """Get buyer by keycloak_uuid with caching."""
        cache_key = f"Buyer_keycloak:{keycloak_uuid}"

        # The out_dto_class parameter (which is _BuyerDTO, effectively BuyerDTO)
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

    # Note: Invalidation for "Buyer_keycloak:{keycloak_uuid}" cache entries
    # is not handled by BaseDAO's update/delete. If BuyerDAO were to override
    # update or delete, it would be responsible for adding invalidation for this key.
    # This is a known limitation as per current subtask instructions.
