from uuid import UUID
from typing import List

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import FileResponse

from backend.daos import GetDAOs
from backend.db.db_dependencies import GetDBSession
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.product_dtos import ProductDTO, ProductInputDTO, ProductUpdateDTO
from backend.dtos.image_dtos import ImageDTO
from backend.dtos.wooden_board_dtos import WoodenBoardDTO
from backend.services.product_service import product_service, ProductCreationResult
from backend.services.file_service import file_service

router = APIRouter(prefix="/products")


@router.post("/", status_code=201)
async def create_product(
    input_dto: ProductInputDTO,
    daos: GetDAOs,
) -> DataResponse[ProductDTO]:
    """Create a new Product."""
    created_obj = await daos.product.create(input_dto)
    return DataResponse(data=ProductDTO.model_validate(created_obj))


@router.patch("/{product_id}", status_code=200)
async def update_product(
    product_id: UUID,
    input_dto: ProductUpdateDTO,
    daos: GetDAOs,
) -> DataResponse[ProductDTO]:
    """Update a Product."""
    updated_obj = await daos.product.update(product_id, input_dto)
    return DataResponse(data=ProductDTO.model_validate(updated_obj))


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


@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: UUID,
    daos: GetDAOs,
    session: GetDBSession,
) -> None:
    """Delete a Product with cleanup of associated files."""
    await product_service.delete_product_with_cleanup(session, daos, product_id)
    # HTTP 204 No Content must have empty body - no return statement needed


# New endpoints for comprehensive product management

@router.post("/with-image", status_code=201)
async def create_product_with_image(
    session: GetDBSession,
    daos: GetDAOs,
    image: UploadFile = File(..., description="Product image for analysis"),
    title: str = Form(..., description="Product title"),
    description: str = Form(None, description="Product description"),
    price: float = Form(..., description="Product price"),
    delivery_possible: bool = Form(False, description="Delivery available"),
    pickup_location: str = Form(None, description="Pickup location"),
    seller_id: UUID = Form(..., description="Seller ID"),
    wood_type_id: UUID = Form(..., description="Wood type ID"),
    board_height: float = Form(..., description="Board height in meters"),
    board_length: float = Form(..., description="Board length in meters"),
) -> DataResponse[dict]:
    """
    Create a product with image analysis in an atomic transaction.

    This endpoint:
    1. Validates and saves the uploaded image
    2. Analyzes the image for wooden boards using AI
    3. Creates the product record with calculated volume
    4. Creates image and wooden board records
    5. Returns complete product information

    All operations are performed in a single database transaction.
    If any step fails, all changes are rolled back and files are cleaned up.
    """
    product_data = {
        "title": title,
        "descrioption": description,  # Note: backend uses 'descrioption' (typo)
        "price": price,
        "delivery_possible": delivery_possible,
        "pickup_location": pickup_location,
        "seller_id": seller_id,
        "wood_type_id": wood_type_id,
        # volume will be calculated from image analysis
    }

    result = await product_service.create_product_with_image_analysis(
        session, daos, product_data, image, board_height, board_length
    )

    return DataResponse(data={
        "product": result.product.model_dump(),
        "image": result.image.model_dump(),
        "wooden_boards": [board.model_dump() for board in result.wooden_boards],
        "total_volume": result.total_volume,
        "board_count": result.board_count,
    })
