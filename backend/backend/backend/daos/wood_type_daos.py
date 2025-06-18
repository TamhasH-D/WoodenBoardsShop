import sqlalchemy as sa  # Added

from backend.daos.base_daos import BaseDAO
from backend.dtos.wood_type_dtos import WoodTypeInputDTO, WoodTypeUpdateDTO
from backend.exceptions import DuplicateEntryError  # Added
from backend.models.wood_type_models import WoodType


class WoodTypeDAO(
    BaseDAO[
        WoodType,
        WoodTypeInputDTO,
        WoodTypeUpdateDTO,
    ]
):
    """WoodType DAO."""

    async def create(  # Overridden method
        self,
        input_dto: WoodTypeInputDTO,
    ) -> WoodType:
        """Create and return a new wood type, checking for name uniqueness."""
        name = input_dto.name
        existing_wood_type = await self.filter_first(
            sa.func.lower(self.model.name) == sa.func.lower(name)
        )
        if existing_wood_type:
            raise DuplicateEntryError("A wood type with this name already exists.")

        # Call super().create without unique_check_params as BaseDAO's IntegrityError
        # handler will catch general unique constraint violations if any (e.g. if we add other unique fields later)
        # The primary check for 'name' is done above.
        return await super().create(input_dto)
