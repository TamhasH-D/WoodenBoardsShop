from uuid import UUID, uuid4

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from backend.daos import GetDAOs
from backend.dtos import (
    DataResponse,
    EmptyResponse,
    OffsetResults,
    Pagination,
)
from backend.dtos.image_dtos import ImageDTO, ImageInputDTO, ImageUpdateDTO
from backend.services.image_service import image_service

router = APIRouter(prefix="/images")


@router.post("/", status_code=201)
async def create_image(
    input_dto: ImageInputDTO,
    daos: GetDAOs,
) -> DataResponse[ImageDTO]:
    """Create a new Image record (metadata only)."""
    created_obj = await daos.image.create(input_dto)
    return DataResponse(data=ImageDTO.model_validate(created_obj))


@router.post("/upload", status_code=201)
async def upload_image(
    product_id: UUID,
    daos: GetDAOs,
    image: UploadFile = File(...),
) -> DataResponse[ImageDTO]:
    """Upload image file and create database record."""
    # Validate uploaded file
    image_service.validate_image_file(image)

    # Get product to extract seller_id
    product = await daos.product.filter_first(id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Товар не найден")

    # Generate image ID
    image_id = uuid4()

    try:
        # Save file to filesystem with seller hierarchy
        image_path = await image_service.save_image_file(
            image=image,
            product_id=product_id,
            seller_id=product.seller_id,
            image_id=image_id,
        )

        # Create database record
        image_dto = ImageInputDTO(
            id=image_id,
            image_path=image_path,
            product_id=product_id,
        )

        created_obj = await daos.image.create(image_dto)
        return DataResponse(data=ImageDTO.model_validate(created_obj))

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Clean up file if database operation fails
        try:
            image_service.delete_image_file(image_path)
        except Exception:
            pass  # Ignore cleanup errors

        raise HTTPException(
            status_code=500,
            detail=f"Ошибка создания изображения: {e!s}",
        ) from e


@router.patch("/{image_id}")
async def update_image(
    image_id: UUID,
    update_dto: ImageUpdateDTO,
    daos: GetDAOs,
) -> EmptyResponse:
    """Update Image."""
    await daos.image.update(image_id, update_dto)
    return EmptyResponse()


@router.delete("/{image_id}")
async def delete_image(
    image_id: UUID,
    daos: GetDAOs,
) -> EmptyResponse:
    """Delete a Image by id and remove file from filesystem."""
    # Get image record first to get file path
    image = await daos.image.filter_first(id=image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Изображение не найдено")

    # Delete file from filesystem
    image_service.delete_image_file(image.image_path)

    # Delete record from database
    await daos.image.delete(id=image_id)
    return EmptyResponse()


@router.get("/")
async def get_image_paginated(
    daos: GetDAOs,
    pagination: Pagination,
) -> OffsetResults[ImageDTO]:
    """Get all Images paginated."""
    return await daos.image.get_offset_results(
        out_dto=ImageDTO,
        pagination=pagination,
    )


@router.get("/{image_id}")
async def get_image(
    image_id: UUID,
    daos: GetDAOs,
) -> DataResponse[ImageDTO]:
    """Get a Image metadata by id."""
    image = await daos.image.filter_first(id=image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Изображение не найдено")
    return DataResponse(data=ImageDTO.model_validate(image))


@router.get("/{image_id}/file")
async def get_image_file(
    image_id: UUID,
    daos: GetDAOs,
) -> FileResponse:
    """Get image file by id."""
    # Get image record to get file path
    image = await daos.image.filter_first(id=image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Изображение не найдено")

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
        # Add other common image types if needed
    }
    media_type = media_type_map.get(file_extension, "application/octet-stream")

    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=f"image_{image_id}{file_extension}",
    )
