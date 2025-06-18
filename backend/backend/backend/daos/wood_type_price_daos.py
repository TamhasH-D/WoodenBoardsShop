from backend.daos.base_daos import BaseDAO
from backend.dtos.wood_type_price_dtos import (
    WoodTypePriceInputDTO,
    WoodTypePriceUpdateDTO,
)
from backend.exceptions import DuplicateEntryError  # Added
from backend.models.wood_type_price_models import WoodTypePrice


class WoodTypePriceDAO(
    BaseDAO[
        WoodTypePrice,
        WoodTypePriceInputDTO,
        WoodTypePriceUpdateDTO,
    ]
):
    """WoodTypePrice DAO."""

    async def create(  # Overridden method
        self,
        input_dto: WoodTypePriceInputDTO,
    ) -> WoodTypePrice:
        """
        Create and return a new wood type price,
        checking for uniqueness based on wood_type_id and seller_id.
        """
        wood_type_id = input_dto.wood_type_id
        seller_id = input_dto.seller_id

        existing_price = await self.filter_first(
            self.model.wood_type_id == wood_type_id,
            self.model.seller_id == seller_id,
        )

        if existing_price:
            raise DuplicateEntryError(
                "A price for this wood type by this seller already exists."
            )

        return await super().create(input_dto)
