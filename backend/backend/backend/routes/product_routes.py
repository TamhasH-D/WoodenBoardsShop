import contextlib
from pathlib import Path
from typing import Annotated
from uuid import UUID, uuid4

import aiofiles
import aiohttp
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession # Added
import redis.asyncio as redis # Added

from backend.services.image_service import image_service
from backend.db.db_dependencies import GetSession # Added
from backend.services.redis.redis_dependencies import GetRedis # Added
from backend.daos.product_daos import ProductDAO # Added
# Removed GetDAOs, will be re-added if some routes still need it for other DAOs
# from backend.daos import GetDAOs
# For other DAOs if needed by some routes (e.g. seller, image, wooden_board)
from backend.daos import GetDAOs # Re-adding for routes that use daos.seller etc.

from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination, # Keep for type hints if functions expect it
    PaginationParamsSortBy,
)
from backend.dtos.image_dtos import ImageDTO, ImageInputDTO
# Using ProductFullDTO for consistency with ProductDAO's OutDTO
from backend.dtos.product_dtos import ProductFilterDTO, ProductInputDTO, ProductUpdateDTO, ProductFullDTO

from backend.dtos.product_with_image_dtos import (
    ProductWithImageInputDTO,
    ProductWithImageUpdateDTO,
    ProductWithImageResponseDTO,
)
from backend.dtos.wooden_board_dtos import WoodenBoardInputDTO, WoodenBoardDTO
from backend.services.product_image_service import product_image_service
from backend.settings import settings

router = APIRouter(prefix="/products")


@router.post("/", status_code=201)
async def create_product(
    input_dto: ProductInputDTO,
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> DataResponse[ProductFullDTO]: # Changed to ProductFullDTO
    """Create a new Product."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    created_obj = await product_dao.create(input_dto)
    # BaseDAO.create returns Model instance. ProductDAO.out_dto is ProductFullDTO.
    return DataResponse(data=ProductFullDTO.model_validate(created_obj))


@router.patch("/{product_id}")
async def update_product(
    product_id: UUID,
    update_dto: ProductUpdateDTO,
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> EmptyResponse:
    """Update Product."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    await product_dao.update(product_id, update_dto)
    return EmptyResponse()


@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> EmptyResponse:
    """Delete a Product by id."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    # Assuming BaseDAO's delete is general, if ProductDAO overrides delete_by_id, use that.
    # ProductDAO has delete_by_id from previous step which calls super().delete_by_id
    await product_dao.delete_by_id(id_=product_id)
    return EmptyResponse()


@router.get("/")
async def get_product_paginated(
    pagination: Pagination, # This is PaginationParams from DTOs, not PaginationType from BaseDAO
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> OffsetResults[ProductFullDTO]: # Changed to ProductFullDTO
    """Get all Products paginated."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    # get_offset_results in BaseDAO now uses self.out_dto (ProductFullDTO for ProductDAO)
    return await product_dao.get_offset_results(
        pagination=pagination, # Pass the pagination from request
    )


@router.get("/search")
async def search_products(
    filters: Annotated[ProductFilterDTO, Depends()],
    offset: int = Query(0, ge=0),
    limit: int = Query(10, le=20, ge=1),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> OffsetResults[ProductFullDTO]: # Changed to ProductFullDTO
    """Search and filter products with advanced criteria."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    pagination_params = PaginationParamsSortBy(
        offset=offset,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order
    )
    # get_filtered_results in ProductDAO now uses self.out_dto (ProductFullDTO)
    return await product_dao.get_filtered_results(
        pagination=pagination_params,
        filters=filters,
    )


@router.get("/my-products")
async def get_my_products(
    seller_id: UUID,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, le=20, ge=1),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
    # Keep GetDAOs if daos.seller is needed and not converted yet
    daos: GetDAOs = Depends(),
) -> OffsetResults[ProductFullDTO]: # Changed to ProductFullDTO
    """Get products for the current seller."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    pagination = PaginationParamsSortBy(
        offset=offset,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order
    )
    seller = await daos.seller.filter_first(id=seller_id) # daos.seller still used
    if seller is None:
        raise HTTPException(status_code=404, detail="Seller not found")
    filters = ProductFilterDTO(seller_ids=[seller.id])
    return await product_dao.get_filtered_results(
        pagination=pagination,
        filters=filters,
    )


@router.get("/my-products/search")
async def search_my_products(
    seller_id: UUID,
    filters: Annotated[ProductFilterDTO, Depends()],
    offset: int = Query(0, ge=0),
    limit: int = Query(10, le=20, ge=1),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
    daos: GetDAOs = Depends(), # daos.seller still used
) -> OffsetResults[ProductFullDTO]: # Changed to ProductFullDTO
    """Search and filter products for the current seller with advanced criteria."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    pagination = PaginationParamsSortBy(
        offset=offset,
        limit=limit,
        sort_by=sort_by,
        sort_order=sort_order
    )
    seller = await daos.seller.filter_first(id=seller_id) # daos.seller still used
    if seller is None:
        raise HTTPException(status_code=404, detail="Seller not found")
    filters.seller_ids = [seller.id]
    return await product_dao.get_filtered_results(
        pagination=pagination,
        filters=filters,
    )


@router.get("/{product_id}")
async def get_product(
    product_id: UUID,
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> DataResponse[ProductFullDTO]: # Changed to ProductFullDTO
    """Get a Product by id."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    # BaseDAO.get_by_id returns Optional[OutDTO] (which is ProductFullDTO)
    # BaseDAO.filter_first returns Optional[Model]. This needs to align.
    # ProductDAO has get_by_id thanks to BaseDAO.
    product = await product_dao.get_by_id(id_=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return DataResponse(data=product) # product is already ProductFullDTO


# Routes using daos.image and daos.wooden_board will keep GetDAOs for now
@router.get("/{product_id}/image")
async def get_product_image(
    product_id: UUID,
    daos: GetDAOs, # Used for product (to check existence) and image
    session: AsyncSession = Depends(GetSession), # For ProductDAO if needed
    redis_client: redis.Redis = Depends(GetRedis), # For ProductDAO if needed
) -> FileResponse:
    """Get the main image for a product by product ID."""
    product_dao = ProductDAO(session=session, redis_client=redis_client) # Instantiate for potential future use

    # Check if product exists using the new product_dao
    # product_check = await product_dao.get_by_id(id_=product_id) # More direct
    # For now, stick to daos.product.filter_first if it's simpler and GetDAOs is kept for other DAOs
    product_check = await daos.product.filter_first(id=product_id)

    if not product_check: # product_check is a Model instance from filter_first
        raise HTTPException(status_code=404, detail="Товар не найден")

    image = await daos.image.filter_first(product_id=product_id) # daos.image used
    if not image:
        raise HTTPException(status_code=404, detail="Изображение для товара не найдено")

    file_path = image_service.get_image_file_path(image.image_path)
    file_extension = file_path.suffix.lower()
    media_type_map = {".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp"}
    media_type = media_type_map.get(file_extension, "image/jpeg")
    return FileResponse(path=file_path, media_type=media_type, filename=f"product_{product_id}{file_extension}")


@router.get("/{product_id}/boards/stats")
async def get_product_boards_stats(
    product_id: UUID,
    daos: GetDAOs, # Used for product, image, wooden_board
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> DataResponse[dict]:
    """Get statistics for wooden boards of a specific product."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    # product = await product_dao.get_by_id(id_=product_id) # Returns ProductFullDTO
    # Sticking to daos.product.filter_first for now
    product_model_instance = await daos.product.filter_first(id=product_id) # Returns Model
    if not product_model_instance:
        raise HTTPException(status_code=404, detail="Товар не найден")

    images = await daos.image.filter(product_id=product_id)
    boards = []
    if images:
        for image_in_list in images: # renamed image to image_in_list to avoid conflict
            image_boards = await daos.wooden_board.filter(image_id=image_in_list.id)
            boards.extend(image_boards)

    if not boards:
        return DataResponse(data={
            "total_count": 0,
            "average_height": product_model_instance.board_height / 1000 if product_model_instance.board_height else None,
            "average_width": None,
            "average_length": product_model_instance.board_length / 1000 if product_model_instance.board_length else None,
            "total_volume": 0.0
        })

    total_count = len(boards)
    heights = [b.height for b in boards if b.height is not None and b.height > 0]
    widths = [b.width for b in boards if b.width is not None and b.width > 0]
    lengths = [b.lenght for b in boards if b.lenght is not None and b.lenght > 0]

    avg_h = sum(heights) / len(heights) if heights else (product_model_instance.board_height / 1000 if product_model_instance.board_height else None)
    avg_w = sum(widths) / len(widths) if widths else None
    avg_l = sum(lengths) / len(lengths) if lengths else (product_model_instance.board_length / 1000 if product_model_instance.board_length else None)

    total_volume = sum(b.height * b.width * b.lenght for b in boards if b.height and b.width and b.lenght and all(x > 0 for x in [b.height, b.width, b.lenght]))

    return DataResponse(data={
        "total_count": total_count,
        "average_height": round(avg_h, 2) if avg_h else None,
        "average_width": round(avg_w, 2) if avg_w else None,
        "average_length": round(avg_l, 2) if avg_l else None,
        "total_volume": round(total_volume, 4)
    })

@router.get("/{product_id}/wooden-boards")
async def get_product_wooden_boards(
    product_id: UUID,
    pagination: Pagination, # This is PaginationParams
    daos: GetDAOs, # Used for product, image, wooden_board
    session: AsyncSession = Depends(GetSession),
    redis_client: redis.Redis = Depends(GetRedis),
) -> OffsetResults[WoodenBoardDTO]:
    """Get wooden boards for a specific product with pagination."""
    product_dao = ProductDAO(session=session, redis_client=redis_client)
    # product = await product_dao.get_by_id(id_=product_id) # Returns ProductFullDTO
    product_model_instance = await daos.product.filter_first(id=product_id) # Returns Model
    if not product_model_instance:
        raise HTTPException(status_code=404, detail="Товар не найден")

    images = await daos.image.filter(product_id=product_id)
    if not images:
        return OffsetResults(data=[], pagination=OffsetPaginationMetadata(total=0, limit=pagination.limit, offset=pagination.offset)) # Ensure correct pagination obj

    all_boards = []
    for image_in_list in images: # Renamed
        image_boards = await daos.wooden_board.filter(image_id=image_in_list.id)
        all_boards.extend(image_boards)

    total = len(all_boards)
    start_idx = pagination.offset
    end_idx = start_idx + pagination.limit
    paginated_boards = all_boards[start_idx:end_idx]
    board_dtos = [WoodenBoardDTO.model_validate(b) for b in paginated_boards]
    return OffsetResults(data=board_dtos, pagination=OffsetPaginationMetadata(total=total, limit=pagination.limit, offset=pagination.offset))


# Routes for /with-image use product_image_service, which takes `daos: GetDAOs`.
# These will remain unchanged for now as the service layer might need broader DAO access.
# If caching is desired for these, product_image_service would need to be updated
# to use ProductDAO with redis_client.
@router.post("/with-image", status_code=201)
async def create_product_with_image(
    daos: GetDAOs, # product_image_service expects GetDAOs
    seller_id: Annotated[UUID, Form()],
    title: Annotated[str, Form()],
    wood_type_id: Annotated[UUID, Form()],
    board_height: Annotated[float, Form()],
    board_length: Annotated[float, Form()],
    volume: Annotated[float, Form()],
    price: Annotated[float, Form()],
    image: Annotated[UploadFile, File()], # Renamed from image_in_form
    description: Annotated[str | None, Form()] = None,
    delivery_possible: Annotated[bool, Form()] = False,
    pickup_location: Annotated[str | None, Form()] = None,
) -> DataResponse[ProductWithImageResponseDTO]:
    product_data = ProductWithImageInputDTO(
        seller_id=seller_id, title=title, description=description, wood_type_id=wood_type_id,
        board_height=board_height, board_length=board_length, volume=volume, price=price,
        delivery_possible=delivery_possible, pickup_location=pickup_location,
    )
    result = await product_image_service.create_product_with_image(
        daos=daos, product_data=product_data, image=image,
    )
    return DataResponse(data=result)


@router.patch("/{product_id}/with-image")
async def update_product_with_image(
    product_id: UUID,
    daos: GetDAOs, # product_image_service expects GetDAOs
    title: Annotated[str | None, Form()] = None,
    description: Annotated[str | None, Form()] = None,
    wood_type_id: Annotated[UUID | None, Form()] = None,
    board_height: Annotated[float | None, Form()] = None,
    board_length: Annotated[float | None, Form()] = None,
    volume: Annotated[float | None, Form()] = None,
    price: Annotated[float | None, Form()] = None,
    delivery_possible: Annotated[bool | None, Form()] = None,
    pickup_location: Annotated[str | None, Form()] = None,
    image: Annotated[UploadFile | None, File()] = None, # Renamed
) -> DataResponse[ProductWithImageResponseDTO]:
    product_data = ProductWithImageUpdateDTO(
        title=title, description=description, wood_type_id=wood_type_id,
        board_height=board_height, board_length=board_length, volume=volume, price=price,
        delivery_possible=delivery_possible, pickup_location=pickup_location,
    )
    result = await product_image_service.update_product_with_image(
        daos=daos, product_id=product_id, product_data=product_data, image=image,
    )
    return DataResponse(data=result)


@router.delete("/{product_id}/with-images")
async def delete_product_with_images(
    product_id: UUID,
    daos: GetDAOs, # product_image_service expects GetDAOs
) -> EmptyResponse:
    await product_image_service.delete_product_with_images(
        daos=daos, product_id=product_id,
    )
    return EmptyResponse()
