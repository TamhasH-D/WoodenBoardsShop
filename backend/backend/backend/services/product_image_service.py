"""Service for product operations with image analysis."""

import contextlib
import json
from pathlib import Path
from uuid import UUID, uuid4
from typing import Dict, Any

import aiofiles
import httpx
from fastapi import HTTPException, UploadFile

from backend.daos import AllDAOs
from backend.dtos.image_dtos import ImageInputDTO
from backend.dtos.product_dtos import ProductInputDTO, ProductUpdateDTO
from backend.dtos.product_with_image_dtos import (
    ProductWithImageInputDTO,
    ProductWithImageUpdateDTO,
    ProductWithImageResponseDTO,
    ImageAnalysisResultDTO,
)
from backend.dtos.wooden_board_dtos import WoodenBoardInputDTO
from backend.services.image_service import image_service
from backend.settings import settings


class ProductImageService:
    """Service for handling product operations with image analysis."""

    def __init__(self):
        """Initialize product image service."""
        self.yolo_base_url = getattr(settings, 'prosto_board_volume_seg_url', 'http://localhost:8001')

    async def analyze_image(
        self,
        image: UploadFile,
        board_height: float,
        board_length: float,
    ) -> ImageAnalysisResultDTO:
        """
        Analyze image using YOLO backend.
        
        Args:
            image: Uploaded image file
            board_height: Height of boards in mm
            board_length: Length of boards in mm
            
        Returns:
            ImageAnalysisResultDTO: Analysis results
            
        Raises:
            HTTPException: If analysis fails
        """
        try:
            # Reset file position
            await image.seek(0)

            # Convert mm to meters for YOLO backend (same as in wooden_board_routes.py)
            height_in_meters = (
                board_height / 1000 if board_height > 0 else 0.05
            )  # default 50mm
            length_in_meters = (
                board_length / 1000 if board_length > 0 else 6.0
            )  # default 6000mm

            # Prepare form data for YOLO backend
            form_data = {
                'height': str(height_in_meters),
                'length': str(length_in_meters),
            }
            
            files = {
                'image': (image.filename, await image.read(), image.content_type)
            }
            
            # Send request to YOLO backend (using same URL pattern as wooden_board_routes.py)
            base_url = self.yolo_base_url.rstrip('/')
            volume_service_url = f"{base_url}/wooden_boards_volume_seg/?height={height_in_meters}&length={length_in_meters}"

            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    volume_service_url,
                    files=files,
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=500,
                        detail=f"Ошибка анализа изображения: {response.status_code}",
                    )
                
                result = response.json()
                
                # Validate analysis result
                if not result.get("wooden_boards") or len(result["wooden_boards"]) == 0:
                    raise HTTPException(
                        status_code=400,
                        detail="На изображении не обнаружено досок. Пожалуйста, загрузите изображение с четко видимыми досками.",
                    )
                
                return ImageAnalysisResultDTO(
                    wooden_boards=result["wooden_boards"],
                    total_volume=result.get("total_volume", 0.0),
                    board_count=len(result["wooden_boards"]),
                    analysis_metadata=result.get("metadata"),
                )
                
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Сервис анализа изображений недоступен: {e!s}",
            ) from e
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка при анализе изображения: {e!s}",
            ) from e

    async def create_product_with_image(
        self,
        daos: AllDAOs,
        product_data: ProductWithImageInputDTO,
        image: UploadFile,
    ) -> ProductWithImageResponseDTO:
        """
        Create product with image analysis.
        
        Args:
            daos: Database access objects
            product_data: Product data
            image: Image file
            
        Returns:
            ProductWithImageResponseDTO: Created product info
        """
        # Step 1: Validate seller exists
        seller = await daos.seller.filter_first(id=product_data.seller_id)
        if not seller:
            raise HTTPException(
                status_code=404,
                detail="Продавец не найден",
            )

        # Step 2: Validate wood type exists
        wood_type = await daos.wood_type.filter_first(id=product_data.wood_type_id)
        if not wood_type:
            raise HTTPException(
                status_code=404,
                detail="Тип древесины не найден",
            )

        # Step 3: Validate image file
        image_service.validate_image_file(image)

        # Step 4: Analyze image
        analysis_result = await self.analyze_image(
            image=image,
            board_height=product_data.board_height,
            board_length=product_data.board_length,
        )

        # Step 5: Generate UUIDs
        product_id = uuid4()
        image_id = uuid4()

        try:
            # Step 6: Create product
            product_dto = ProductInputDTO(
                id=product_id,
                volume=analysis_result.total_volume,
                price=product_data.price,
                title=product_data.title.strip(),
                descrioption=product_data.description.strip() if product_data.description else None,
                delivery_possible=product_data.delivery_possible,
                pickup_location=product_data.pickup_location.strip() if product_data.pickup_location else None,
                seller_id=seller.id,
                wood_type_id=product_data.wood_type_id,
            )

            await daos.product.create(product_dto)

            # Step 7: Save image file
            image_path = await image_service.save_image_file(
                image=image,
                product_id=product_id,
                seller_id=seller.id,
                image_id=image_id,
            )

            # Step 8: Create image record
            image_dto = ImageInputDTO(
                id=image_id,
                image_path=image_path,
                product_id=product_id,
            )

            await daos.image.create(image_dto)

            # Step 9: Create wooden board records
            for board_data in analysis_result.wooden_boards:
                board_dto = WoodenBoardInputDTO(
                    id=uuid4(),
                    height=board_data.get("height", product_data.board_height),
                    width=board_data.get("width", 0.0),
                    lenght=board_data.get("length", product_data.board_length),
                    image_id=image_id,
                )
                await daos.wooden_board.create(board_dto)

            return ProductWithImageResponseDTO(
                product_id=product_id,
                seller_id=seller.id,
                image_id=image_id,
                analysis_result=analysis_result.model_dump(),
                wooden_boards_count=analysis_result.board_count,
                total_volume=analysis_result.total_volume,
                message="Товар успешно создан с анализом изображения",
            )

        except Exception as e:
            # Cleanup on error
            await self._cleanup_on_error(daos, product_id, image_id, image_path if 'image_path' in locals() else None)
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка создания товара: {e!s}",
            ) from e

    async def update_product_with_image(
        self,
        daos: AllDAOs,
        product_id: UUID,
        product_data: ProductWithImageUpdateDTO,
        image: UploadFile | None = None,
    ) -> ProductWithImageResponseDTO:
        """
        Update product with optional image analysis.
        
        Args:
            daos: Database access objects
            product_id: Product ID to update
            product_data: Updated product data
            image: Optional new image file
            
        Returns:
            ProductWithImageResponseDTO: Updated product info
        """
        # Step 1: Validate product exists
        existing_product = await daos.product.filter_first(id=product_id)
        if not existing_product:
            raise HTTPException(
                status_code=404,
                detail="Товар не найден",
            )

        # Step 2: Validate wood type if provided
        if product_data.wood_type_id:
            wood_type = await daos.wood_type.filter_first(id=product_data.wood_type_id)
            if not wood_type:
                raise HTTPException(
                    status_code=404,
                    detail="Тип древесины не найден",
                )

        analysis_result = None
        new_image_id = None
        old_image_ids = []

        try:
            # Initialize variables
            analysis_result = None
            new_image_id = None

            # Step 3: Handle image update if provided
            if image:
                # Validate image file
                image_service.validate_image_file(image)

                # Get old images for cleanup
                old_images = await daos.image.filter(product_id=product_id)
                old_image_ids = [img.id for img in old_images]

                # Analyze new image
                analysis_result = await self.analyze_image(
                    image=image,
                    board_height=product_data.board_height or 50.0,
                    board_length=product_data.board_length or 1000.0,
                )

                # Generate new image ID
                new_image_id = uuid4()

                # Save new image file
                image_path = await image_service.save_image_file(
                    image=image,
                    product_id=product_id,
                    seller_id=existing_product.seller_id,
                    image_id=new_image_id,
                )

                # Create new image record
                image_dto = ImageInputDTO(
                    id=new_image_id,
                    image_path=image_path,
                    product_id=product_id,
                )

                await daos.image.create(image_dto)

                # Delete old images
                for old_image in old_images:
                    image_service.delete_image_file(old_image.image_path)
                    await daos.image.delete(id=old_image.id)

                # Delete old wooden boards
                for old_image_id in old_image_ids:
                    old_boards = await daos.wooden_board.filter(image_id=old_image_id)
                    for board in old_boards:
                        await daos.wooden_board.delete(id=board.id)

                # Create new wooden board records
                for board_data in analysis_result.wooden_boards:
                    board_dto = WoodenBoardInputDTO(
                        id=uuid4(),
                        height=board_data.get("height", product_data.board_height or 50.0),
                        width=board_data.get("width", 0.0),
                        lenght=board_data.get("length", product_data.board_length or 1000.0),
                        image_id=new_image_id,
                    )
                    await daos.wooden_board.create(board_dto)

            # Step 4: Update product
            update_data = {}
            if product_data.title is not None:
                update_data["title"] = product_data.title.strip()
            if product_data.description is not None:
                update_data["descrioption"] = product_data.description.strip() if product_data.description else None
            if product_data.wood_type_id is not None:
                update_data["wood_type_id"] = product_data.wood_type_id
            if product_data.price is not None:
                update_data["price"] = product_data.price
            if product_data.delivery_possible is not None:
                update_data["delivery_possible"] = product_data.delivery_possible
            if product_data.pickup_location is not None:
                update_data["pickup_location"] = product_data.pickup_location.strip() if product_data.pickup_location else None
            
            # Update volume if image was analyzed
            if analysis_result:
                update_data["volume"] = analysis_result.total_volume

            if update_data:
                product_update_dto = ProductUpdateDTO(**update_data)
                await daos.product.update(product_id, product_update_dto)

            # Get current image ID for response
            current_image_id = None
            if new_image_id:
                current_image_id = new_image_id
            else:
                # Get existing image if no new image was uploaded
                existing_images = await daos.image.filter(product_id=product_id)
                if existing_images:
                    current_image_id = existing_images[0].id

            return ProductWithImageResponseDTO(
                product_id=product_id,
                seller_id=existing_product.seller_id,
                image_id=current_image_id,
                analysis_result=analysis_result.model_dump() if analysis_result else {},
                wooden_boards_count=analysis_result.board_count if analysis_result else 0,
                total_volume=analysis_result.total_volume if analysis_result else existing_product.volume,
                message="Товар успешно обновлен" + (" с анализом изображения" if image else ""),
            )

        except Exception as e:
            # Cleanup on error
            if new_image_id:
                await self._cleanup_on_error(daos, None, new_image_id, image_path if 'image_path' in locals() else None)
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка обновления товара: {e!s}",
            ) from e

    async def delete_product_with_images(
        self,
        daos: AllDAOs,
        product_id: UUID,
    ) -> None:
        """
        Delete product and all associated images and wooden boards.
        
        Args:
            daos: Database access objects
            product_id: Product ID to delete
        """
        # Step 1: Validate product exists
        existing_product = await daos.product.filter_first(id=product_id)
        if not existing_product:
            raise HTTPException(
                status_code=404,
                detail="Товар не найден",
            )

        try:
            # Step 2: Get all images for the product
            images = await daos.image.filter(product_id=product_id)
            image_ids = [img.id for img in images]

            # Step 3: Delete wooden boards
            for image_id in image_ids:
                boards = await daos.wooden_board.filter(image_id=image_id)
                for board in boards:
                    await daos.wooden_board.delete(id=board.id)

            # Step 4: Delete image files and records
            for image in images:
                image_service.delete_image_file(image.image_path)
                await daos.image.delete(id=image.id)

            # Step 5: Delete product
            await daos.product.delete(id=product_id)

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка удаления товара: {e!s}",
            ) from e

    async def _cleanup_on_error(
        self,
        daos: AllDAOs,
        product_id: UUID | None,
        image_id: UUID | None,
        image_path: str | None,
    ) -> None:
        """Clean up resources on error."""
        try:
            if product_id:
                await daos.product.delete(id=product_id)
            if image_id:
                await daos.image.delete(id=image_id)
            if image_path:
                image_service.delete_image_file(image_path)
        except Exception:
            pass  # Ignore cleanup errors


# Global instance
product_image_service = ProductImageService()
