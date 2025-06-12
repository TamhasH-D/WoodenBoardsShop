from uuid import UUID

from fastapi import APIRouter, HTTPException

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.buyer_dtos import BuyerDTO, BuyerInputDTO, BuyerUpdateDTO

router = APIRouter(prefix="/buyers")


@router.post("/", status_code=201)
async def create_buyer(
    input_dto: BuyerInputDTO,
    daos: GetDAOs,
) -> DataResponse[BuyerDTO]:
    """Create a new Buyer."""
    created_obj = await daos.buyer.create(input_dto)
    return DataResponse(data=BuyerDTO.model_validate(created_obj))


@router.patch("/{buyer_id}")
async def update_buyer(
    buyer_id: UUID,
    update_dto: BuyerUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update Buyer."""
    await daos.buyer.update(buyer_id, update_dto)
    return EmptyResponse()


@router.delete("/{buyer_id}")
async def delete_buyer(
    buyer_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a Buyer by id."""
    await daos.buyer.delete(id=buyer_id)
    return EmptyResponse()


@router.get("/")
async def get_buyer_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[BuyerDTO]:
    """Get all Buyers paginated."""
    return await daos.buyer.get_offset_results(
        out_dto=BuyerDTO,
        pagination=pagination,
    )


@router.get("/{buyer_id}")
async def get_buyer(
    buyer_id: UUID,
    daos: GetDAOs,
) -> DataResponse[BuyerDTO]:
    """Get a Buyer by id."""
    buyer = await daos.buyer.filter_first(id=buyer_id)
    return DataResponse(data=BuyerDTO.model_validate(buyer))


@router.get("/by-keycloak/{keycloak_uuid}")
async def get_buyer_by_keycloak_uuid(
    keycloak_uuid: UUID,
    daos: GetDAOs,
) -> DataResponse[BuyerDTO]:
    """Get a Buyer by keycloak_uuid."""
    buyer = await daos.buyer.get_by_keycloak_uuid(keycloak_uuid)
    if buyer is None:
        raise HTTPException(status_code=404, detail="Buyer not found")
    return DataResponse(data=BuyerDTO.model_validate(buyer))
