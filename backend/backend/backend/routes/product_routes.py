import contextlib
from pathlib import Path
from typing import Annotated
from uuid import UUID, uuid4

import aiofiles
import aiohttp
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from backend.services.image_service import image_service

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
    PaginationParamsSortBy,
)
from backend.dtos.image_dtos import ImageDTO, ImageInputDTO
from backend.dtos.product_dtos import ProductDTO, ProductFilterDTO, ProductInputDTO, ProductUpdateDTO

from backend.dtos.product_with_image_dtos import (
    ProductWithImageInputDTO,
    ProductWithImageUpdateDTO,
    ProductWithImageResponseDTO,
)
from backend.dtos.wooden_board_dtos import WoodenBoardInputDTO
from backend.services.product_image_service import product_image_service
from backend.settings import settings

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


@router.get("/search")
async def search_products(
    daos: GetDAOs,
    pagination: Annotated[PaginationParamsSortBy, Depends()],
    filters: Annotated[ProductFilterDTO, Depends()],
) -> OffsetResults[ProductDTO]:
    """
    Search and filter products with advanced criteria.

    Supports:
    - Text search in title and description
    - Price and volume range filtering
    - Multiple wood type and seller selection
    - Boolean filters for delivery and pickup
    - Date range filtering
    - Sorting by any product field
    """
    return await daos.product.get_filtered_results(
        out_dto=ProductDTO,
        pagination=pagination,
        filters=filters,
    )


@router.get("/my-products")
async def get_my_products(
    seller_id: UUID,  # TODO: Replace with authentication dependency when Keycloak integration is ready
    daos: GetDAOs,
    pagination: Annotated[PaginationParamsSortBy, Depends()],
) -> OffsetResults[ProductDTO]:
    """
    Get products for the current seller.

    This endpoint returns only products that belong to the seller identified by seller_id.
    Supports pagination and sorting.

    Args:
        seller_id: UUID of the seller (temporary parameter, will be replaced with auth)
        daos: Database access objects
        pagination: Pagination and sorting parameters

    Returns:
        Paginated list of products belonging to the seller

    Raises:
        HTTPException: 404 if seller not found
    """
    # Find seller by id
    seller = await daos.seller.filter_first(id=seller_id)
    if seller is None:
        raise HTTPException(status_code=404, detail="Seller not found")

    # Create filter to show only this seller's products
    filters = ProductFilterDTO(seller_ids=[seller.id])

    return await daos.product.get_filtered_results(
        out_dto=ProductDTO,
        pagination=pagination,
        filters=filters,
    )


@router.get("/my-products/search")
async def search_my_products(
    seller_id: UUID,  # TODO: Replace with authentication dependency when Keycloak integration is ready
    daos: GetDAOs,
    pagination: Annotated[PaginationParamsSortBy, Depends()],
    filters: Annotated[ProductFilterDTO, Depends()],
) -> OffsetResults[ProductDTO]:
    """
    Search and filter products for the current seller with advanced criteria.

    This endpoint allows sellers to search through their own products using all available filters.
    The seller_ids filter is automatically set to the current seller and cannot be overridden.

    Supports:
    - Text search in title and description
    - Price and volume range filtering
    - Wood type filtering
    - Boolean filters for delivery and pickup
    - Date range filtering
    - Sorting by any product field

    Args:
        seller_id: UUID of the seller (temporary parameter, will be replaced with auth)
        daos: Database access objects
        pagination: Pagination and sorting parameters
        filters: Search and filter criteria

    Returns:
        Filtered and paginated list of products belonging to the seller

    Raises:
        HTTPException: 404 if seller not found
    """
    # Find seller by id
    seller = await daos.seller.filter_first(id=seller_id)
    if seller is None:
        raise HTTPException(status_code=404, detail="Seller not found")

    # Override seller_ids filter to ensure security - seller can only see their own products
    filters.seller_ids = [seller.id]

    return await daos.product.get_filtered_results(
        out_dto=ProductDTO,
        pagination=pagination,
        filters=filters,
    )


@router.get("/{product_id}")
async def get_product(
    product_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ProductDTO]:
    """Get a Product by id."""
    product = await daos.product.filter_first(id=product_id)
    return DataResponse(data=ProductDTO.model_validate(product))


@router.get("/{product_id}/image")
async def get_product_image(
    product_id: UUID,
    daos: GetDAOs,
) -> FileResponse:
    """Get the main image for a product by product ID."""


    # Check if product exists
    product = await daos.product.filter_first(id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    # Get the first image for this product
    image = await daos.image.filter_first(product_id=product_id)
    if not image:
        raise HTTPException(status_code=404, detail="Изображение для товара не найдено")

    # Get file path and validate it exists
    file_path = image_service.get_image_file_path(image.image_path)

    # Return file response
    file_extension = file_path.suffix.lower()
    media_type_map = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".webp": "image/webp",
    }

    media_type = media_type_map.get(file_extension, "image/jpeg")

    return FileResponse(
        path=file_path,
        media_type=media_type,
        filename=f"product_{product_id}{file_extension}"
    )






@router.post("/with-image", status_code=201)
async def create_product_with_image(
    daos: GetDAOs,
    seller_id: Annotated[UUID, Form()] = ...,
    title: Annotated[str, Form()] = ...,
    wood_type_id: Annotated[UUID, Form()] = ...,
    board_height: Annotated[float, Form()] = ...,
    board_length: Annotated[float, Form()] = ...,
    volume: Annotated[float, Form()] = ...,
    price: Annotated[float, Form()] = ...,
    image: Annotated[UploadFile, File()] = ...,
    description: Annotated[str | None, Form()] = None,
    delivery_possible: Annotated[bool, Form()] = False,
    pickup_location: Annotated[str | None, Form()] = None,
) -> DataResponse[ProductWithImageResponseDTO]:
    """
    Create a new Product with image analysis using proper layered architecture.

    This endpoint uses Pydantic DTOs and service layer for better structure.
    """
    # Create DTO from form data
    product_data = ProductWithImageInputDTO(
        seller_id=seller_id,
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

    # Use service layer
    result = await product_image_service.create_product_with_image(
        daos=daos,
        product_data=product_data,
        image=image,
    )

    return DataResponse(data=result)


@router.patch("/{product_id}/with-image")
async def update_product_with_image(
    product_id: UUID,
    daos: GetDAOs,
    title: Annotated[str | None, Form()] = None,
    description: Annotated[str | None, Form()] = None,
    wood_type_id: Annotated[UUID | None, Form()] = None,
    board_height: Annotated[float | None, Form()] = None,
    board_length: Annotated[float | None, Form()] = None,
    volume: Annotated[float | None, Form()] = None,
    price: Annotated[float | None, Form()] = None,
    delivery_possible: Annotated[bool | None, Form()] = None,
    pickup_location: Annotated[str | None, Form()] = None,
    image: Annotated[UploadFile | None, File()] = None,
) -> DataResponse[ProductWithImageResponseDTO]:
    """
    Update an existing Product with optional image analysis.

    This endpoint uses Pydantic DTOs and service layer for better structure.
    """
    # Create DTO from form data
    product_data = ProductWithImageUpdateDTO(
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

    # Use service layer
    result = await product_image_service.update_product_with_image(
        daos=daos,
        product_id=product_id,
        product_data=product_data,
        image=image,
    )

    return DataResponse(data=result)


@router.delete("/{product_id}/with-images")
async def delete_product_with_images(
    product_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """
    Delete Product and all associated images and wooden boards.

    This endpoint uses service layer for proper cleanup.
    """
    await product_image_service.delete_product_with_images(
        daos=daos,
        product_id=product_id,
    )

    return EmptyResponse()
