from uuid import UUID

from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.product_dtos import ProductDTO, ProductInputDTO, ProductUpdateDTO
from backend.dtos.product_with_analysis_dtos import (
    ProductWithAnalysisInputDTO,
    ProductWithAnalysisResponseDTO
)
from backend.services.product_with_analysis_service import ProductWithAnalysisService
from backend.db import get_session

router = APIRouter(prefix="/products")


@router.post("/", status_code=201)
async def create_product(
    input_dto: ProductInputDTO,
    daos: GetDAOs,
) -> DataResponse[ProductDTO]:
    """Create a new Product."""
    created_obj = await daos.product.create(input_dto)
    return DataResponse(data=ProductDTO.model_validate(created_obj))


@router.patch("/{product_id}")
async def update_product(
    product_id: UUID,
    update_dto: ProductUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update Product."""
    await daos.product.update(product_id, update_dto)
    return EmptyResponse()


@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a Product by id."""
    await daos.product.delete(id=product_id)
    return EmptyResponse()


@router.get("/")
async def get_product_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[ProductDTO]:
    """Get all Products paginated."""
    return await daos.product.get_offset_results(
        out_dto=ProductDTO,
        pagination=pagination,
    )


@router.get("/{product_id}")
async def get_product(
    product_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ProductDTO]:
    """Get a Product by id."""
    product = await daos.product.filter_first(id=product_id)
    return DataResponse(data=ProductDTO.model_validate(product))


@router.post("/with-analysis", status_code=201)
async def create_product_with_analysis(
    keycloak_id: UUID = Form(...),
    title: str = Form(...),
    description: str = Form(None),
    wood_type_id: UUID = Form(...),
    board_height: float = Form(...),
    board_length: float = Form(...),
    volume: float = Form(...),
    price: float = Form(...),
    delivery_possible: bool = Form(False),
    pickup_location: str = Form(None),
    image: UploadFile = File(...),
    daos: GetDAOs = Depends(),
    session: AsyncSession = Depends(get_session),
) -> DataResponse[ProductWithAnalysisResponseDTO]:
    """
    Create a new Product with image analysis and wooden boards.

    This endpoint:
    1. Validates input data
    2. Sends image to YOLO backend for analysis
    3. Creates product if boards are detected
    4. Saves image to filesystem and database
    5. Creates wooden board records

    Uses database transactions for atomicity.
    """
    # Create input DTO
    input_data = ProductWithAnalysisInputDTO(
        keycloak_id=keycloak_id,
        title=title,
        description=description,
        wood_type_id=wood_type_id,
        board_height=board_height,
        board_length=board_length,
        volume=volume,
        price=price,
        delivery_possible=delivery_possible,
        pickup_location=pickup_location,
    )

    # Create service instance
    service = ProductWithAnalysisService(daos, session)

    # Process request
    result = await service.create_product_with_analysis(input_data, image)

    return DataResponse(data=result)
