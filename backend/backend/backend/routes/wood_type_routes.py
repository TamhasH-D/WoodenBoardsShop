from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException # Added HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession # Added
import redis.asyncio as redis # Added

# Removed GetDAOs as it's being replaced in all routes here
# from backend.daos import GetDAOs
from backend.db.db_dependencies import GetSession # Added
from backend.services.redis.redis_dependencies import GetRedis # Added
from backend.daos.wood_type_daos import WoodTypeDAO # Added

from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination, # This is PaginationParams from DTOs
)
from backend.dtos.wood_type_dtos import WoodTypeDTO, WoodTypeInputDTO, WoodTypeUpdateDTO

router = APIRouter(prefix="/wood-types")


@router.post("/", status_code=201)
async def create_wood_type(
    input_dto: WoodTypeInputDTO,
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> DataResponse[WoodTypeDTO]:
    """Create a new WoodType."""
    wood_type_dao = WoodTypeDAO(session=session, redis_client=redis_client)
    created_obj = await wood_type_dao.create(input_dto)
    return DataResponse(data=WoodTypeDTO.model_validate(created_obj))


@router.patch("/{wood_type_id}")
async def update_wood_type(
    wood_type_id: UUID,
    update_dto: WoodTypeUpdateDTO,
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> EmptyResponse:
    """Update WoodType."""
    wood_type_dao = WoodTypeDAO(session=session, redis_client=redis_client)
    await wood_type_dao.update(wood_type_id, update_dto)
    return EmptyResponse()


@router.delete("/{wood_type_id}")
async def delete_wood_type(
    wood_type_id: UUID,
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> EmptyResponse:
    """Delete a WoodType by id."""
    wood_type_dao = WoodTypeDAO(session=session, redis_client=redis_client)
    # Using delete_by_id from BaseDAO now
    await wood_type_dao.delete_by_id(id_=wood_type_id)
    return EmptyResponse()


@router.get("/")
async def get_wood_type_paginated(
    pagination: Pagination, # This is PaginationParams from DTOs
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> OffsetResults[WoodTypeDTO]:
    """Get all WoodTypes paginated."""
    wood_type_dao = WoodTypeDAO(session=session, redis_client=redis_client)
    # get_offset_results in BaseDAO uses self.out_dto (WoodTypeDTO for WoodTypeDAO)
    return await wood_type_dao.get_offset_results(
        pagination=pagination,
    )


@router.get("/{wood_type_id}")
async def get_wood_type(
    wood_type_id: UUID,
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> DataResponse[WoodTypeDTO]:
    """Get a WoodType by id."""
    wood_type_dao = WoodTypeDAO(session=session, redis_client=redis_client)
    # Using get_by_id from BaseDAO which returns Optional[OutDTO]
    wood_type = await wood_type_dao.get_by_id(id_=wood_type_id)
    if not wood_type:
        raise HTTPException(status_code=404, detail="WoodType not found")
    return DataResponse(data=wood_type) # wood_type is already WoodTypeDTO here
