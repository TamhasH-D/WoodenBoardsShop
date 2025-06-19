from typing import Optional # Added
from sqlalchemy.ext.asyncio import AsyncSession # Added
import redis.asyncio as redis # Added

from backend.daos.base_daos import BaseDAO
from backend.dtos.wood_type_dtos import WoodTypeInputDTO, WoodTypeUpdateDTO, WoodTypeDTO # Added WoodTypeDTO
from backend.models.wood_type_models import WoodType


class WoodTypeDAO(
    BaseDAO[
        WoodType,
        WoodTypeInputDTO,
        WoodTypeUpdateDTO,
        WoodTypeDTO, # Added WoodTypeDTO as OutDTO
    ]
):
    """WoodType DAO."""

    def __init__(self, session: AsyncSession, redis_client: Optional[redis.Redis] = None): # Added __init__
        super().__init__(session, redis_client=redis_client)
