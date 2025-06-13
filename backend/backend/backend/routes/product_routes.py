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
from backend.dtos.image_dtos import ImageInputDTO
from backend.dtos.product_dtos import ProductDTO, ProductFilterDTO, ProductInputDTO, ProductUpdateDTO
from backend.dtos.product_with_analysis_dtos import ProductWithAnalysisResponseDTO
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
    keycloak_id: UUID,  # TODO: Replace with authentication dependency when Keycloak integration is ready
    daos: GetDAOs,
    pagination: Annotated[PaginationParamsSortBy, Depends()],
) -> OffsetResults[ProductDTO]:
    """
    Get products for the current seller.

    This endpoint returns only products that belong to the seller identified by keycloak_id.
    Supports pagination and sorting.

    Args:
        keycloak_id: Keycloak UUID of the seller (temporary parameter, will be replaced with auth)
        daos: Database access objects
        pagination: Pagination and sorting parameters

    Returns:
        Paginated list of products belonging to the seller

    Raises:
        HTTPException: 404 if seller not found
    """
    # Find seller by keycloak_uuid
    seller = await daos.seller.get_by_keycloak_uuid(keycloak_id)
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
    keycloak_id: UUID,  # TODO: Replace with authentication dependency when Keycloak integration is ready
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
        keycloak_id: Keycloak UUID of the seller (temporary parameter, will be replaced with auth)
        daos: Database access objects
        pagination: Pagination and sorting parameters
        filters: Search and filter criteria

    Returns:
        Filtered and paginated list of products belonging to the seller

    Raises:
        HTTPException: 404 if seller not found
    """
    # Find seller by keycloak_uuid
    seller = await daos.seller.get_by_keycloak_uuid(keycloak_id)
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


@router.post("/with-analysis", status_code=201)
async def create_product_with_analysis(
    keycloak_id: Annotated[UUID, Form(...)],
    title: Annotated[str, Form(...)],
    wood_type_id: Annotated[UUID, Form(...)],
    board_height: Annotated[float, Form(...)],
    board_length: Annotated[float, Form(...)],
    volume: Annotated[float, Form(...)],
    price: Annotated[float, Form(...)],
    image: Annotated[UploadFile, File(...)],
    description: Annotated[str | None, Form(None)] = None,
    delivery_possible: Annotated[bool, Form(False)] = False,
    pickup_location: Annotated[str | None, Form(None)] = None,

    # передаём сам класс GetDAOs, FastAPI создаст его экземпляр
    daos: GetDAOs = Depends(GetDAOs),
) -> DataResponse[ProductWithAnalysisResponseDTO]:
    """
    Create a new Product with image analysis and wooden boards.

    This endpoint:
    1. Validates input data
    2. Sends image to YOLO backend for analysis
    3. Creates product if boards are detected
    4. Saves image to filesystem and database
    5. Creates wooden board records
    """
    # Step 1: Validate input data
    if not title or not title.strip():
        raise HTTPException(
            status_code=400, detail="Название товара не может быть пустым"
        )

    if volume <= 0:
        raise HTTPException(status_code=400, detail="Объем должен быть больше 0")

    if price <= 0:
        raise HTTPException(status_code=400, detail="Цена должна быть больше 0")

    if board_height <= 0 or board_height > 1000:
        raise HTTPException(
            status_code=400, detail="Высота доски должна быть от 0 до 1000 мм"
        )

    if board_length <= 0 or board_length > 10000:
        raise HTTPException(
            status_code=400, detail="Длина доски должна быть от 0 до 10000 мм"
        )

    # Step 2: Get seller by keycloak_id
    seller = await daos.seller.get_by_keycloak_uuid(keycloak_id)
    if not seller:
        raise HTTPException(
            status_code=404, detail="Продавец с указанным keycloak_id не найден"
        )

    # Step 3: Validate wood type exists
    wood_type = await daos.wood_type.filter_first(id=wood_type_id)
    if not wood_type:
        raise HTTPException(status_code=404, detail="Тип древесины не найден")

    # Step 4: Analyze image with YOLO backend
    try:
        # Convert mm to meters for YOLO backend
        height_m = board_height / 1000
        length_m = board_length / 1000

        async with aiohttp.ClientSession() as session:
            # Prepare form data
            form_data = aiohttp.FormData()

            # Reset file position and read content
            await image.seek(0)
            image_content = await image.read()

            form_data.add_field(
                "image",
                image_content,
                filename=image.filename or "board.jpg",
                content_type=image.content_type or "image/jpeg",
            )
            form_data.add_field("height", str(height_m))
            form_data.add_field("length", str(length_m))

            # Send request to YOLO backend
            yolo_url = f"{settings.prosto_board_volume_seg_url}/wooden_boards_volume_seg/"
            async with session.post(yolo_url, data=form_data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise HTTPException(
                        status_code=500,
                        detail=f"Ошибка анализа изображения: {error_text}",
                    )

                analysis_result = await response.json()

    except aiohttp.ClientError as e:
        raise HTTPException(
            status_code=503, detail=f"Сервис анализа изображений недоступен: {e!s}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Неожиданная ошибка при анализе изображения: {e!s}",
        )

    # Step 5: Validate analysis result
    if (
        not analysis_result.get("wooden_boards")
        or len(analysis_result["wooden_boards"]) == 0
    ):
        raise HTTPException(
            status_code=400,
            detail="На изображении не обнаружено досок. Пожалуйста, загрузите изображение с четко видимыми досками.",
        )

    # Step 6: Generate UUIDs
    product_id = uuid4()
    image_id = uuid4()

    # Step 7: Create product
    product_dto = ProductInputDTO(
        id=product_id,
        volume=volume,
        price=price,
        title=title.strip(),
        descrioption=description.strip() if description else None,
        delivery_possible=delivery_possible,
        pickup_location=pickup_location.strip() if pickup_location else None,
        seller_id=seller.id,
        wood_type_id=wood_type_id,
    )

    await daos.product.create(product_dto)

    # Step 8: Save image to filesystem using image service
    try:
        from backend.services.image_service import image_service

        image_path = await image_service.save_image_file(
            image=image,
            product_id=product_id,
            seller_id=seller.id,
            image_id=image_id,
        )

    except Exception as e:
        # Clean up created product
        await daos.product.delete(id=product_id)
        raise HTTPException(
            status_code=500, detail=f"Ошибка сохранения изображения: {e!s}"
        )

    # Step 9: Create image record
    try:
        image_dto = ImageInputDTO(
            id=image_id, image_path=image_path, product_id=product_id
        )

        await daos.image.create(image_dto)

    except Exception as e:
        # Clean up created product and file
        await daos.product.delete(id=product_id)
        with contextlib.suppress(Exception):
            Path(image_path).unlink()
        raise HTTPException(
            status_code=500, detail=f"Ошибка создания записи изображения: {e!s}"
        )

    # Step 10: Create wooden board records
    wooden_boards = []
    try:
        for board_data in analysis_result["wooden_boards"]:
            board_dto = WoodenBoardInputDTO(
                id=uuid4(),
                height=board_data.get("height", 0.0),
                width=board_data.get("width", 0.0),
                lenght=board_data.get("length", 0.0),  # Note: keeping backend typo
                image_id=image_id,
            )

            board = await daos.wooden_board.create(board_dto)
            wooden_boards.append(board)

    except Exception as e:
        # Clean up everything created so far
        await daos.product.delete(id=product_id)
        await daos.image.delete(id=image_id)
        with contextlib.suppress(Exception):
            Path(image_path).unlink()
        raise HTTPException(
            status_code=500, detail=f"Ошибка создания записей досок: {e!s}"
        )

    # Return success response
    return DataResponse(
        data=ProductWithAnalysisResponseDTO(
            product_id=product_id,
            seller_id=seller.id,
            image_id=image_id,
            analysis_result=analysis_result,
            wooden_boards_count=len(wooden_boards),
            total_volume=analysis_result.get("total_volume", 0.0),
            message="Товар успешно создан с анализом изображения",
        )
    )


@router.post("/with-image", status_code=201)
async def create_product_with_image(
    daos: GetDAOs,
    keycloak_id: Annotated[UUID, Form()] = ...,
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
