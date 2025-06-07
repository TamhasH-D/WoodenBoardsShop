"""
Product service for handling complex product creation workflows.
Provides atomic transactions for product creation with images and wooden boards.
"""

import asyncio
from typing import List, Dict, Any, Optional
from uuid import UUID
from fastapi import UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from backend.daos import AllDAOs
from backend.dtos.product_dtos import ProductInputDTO, ProductDTO
from backend.dtos.image_dtos import ImageInputDTO, ImageDTO
from backend.dtos.wooden_board_dtos import WoodenBoardInputDTO, WoodenBoardDTO
from backend.services.file_service import file_service
from backend.services.wooden_board_analysis_service import WoodenBoardAnalysisService


class ProductCreationResult:
    """Result of product creation workflow."""
    
    def __init__(self, product: ProductDTO, image: ImageDTO, wooden_boards: List[WoodenBoardDTO]):
        self.product = product
        self.image = image
        self.wooden_boards = wooden_boards
        self.total_volume = sum(board.volume for board in wooden_boards)
        self.board_count = len(wooden_boards)


class ProductService:
    """Service for managing complex product operations."""
    
    def __init__(self):
        self.analysis_service = WoodenBoardAnalysisService()
    
    async def create_product_with_image_analysis(
        self,
        session: AsyncSession,
        daos: AllDAOs,
        product_data: Dict[str, Any],
        image_file: UploadFile,
        board_height: float,
        board_length: float
    ) -> ProductCreationResult:
        """
        Create a product with image analysis in an atomic transaction.
        
        Args:
            session: Database session for transaction
            daos: Data access objects
            product_data: Product information
            image_file: Uploaded image file
            board_height: Board height in meters
            board_length: Board length in meters
            
        Returns:
            ProductCreationResult with created entities
            
        Raises:
            HTTPException: If any step fails
        """
        saved_file_path = None
        
        try:
            # Start transaction
            async with session.begin():
                # Step 1: Save and validate image file
                saved_file_path = await file_service.save_uploaded_file(image_file, "products")
                
                # Step 2: Analyze image for wooden boards
                analysis_result = await self.analysis_service.analyze_image(
                    image_file, board_height, board_length
                )
                
                if not analysis_result or analysis_result.total_count == 0:
                    raise HTTPException(
                        status_code=422,
                        detail="No wooden boards detected in the image. Please upload a clear image of wooden boards."
                    )
                
                # Step 3: Create product record
                # Use calculated volume from analysis if not provided
                if 'volume' not in product_data or not product_data['volume']:
                    product_data['volume'] = analysis_result.total_volume
                
                product_input = ProductInputDTO(**product_data)
                product_obj = await daos.product.create(product_input)
                product_dto = ProductDTO.model_validate(product_obj)
                
                # Step 4: Create image record
                image_input = ImageInputDTO(
                    image_path=saved_file_path,
                    product_id=product_dto.id
                )
                image_obj = await daos.image.create(image_input)
                image_dto = ImageDTO.model_validate(image_obj)
                
                # Step 5: Create wooden board records
                wooden_board_dtos = []
                for board_data in analysis_result.wooden_boards:
                    board_input = WoodenBoardInputDTO(
                        height=board_data.height,
                        width=board_data.width,
                        length=board_data.length,  # Fixed field name to match migration
                        volume=board_data.volume,
                        confidence=board_data.detection.confidence,
                        image_id=image_dto.id,
                        product_id=product_dto.id
                    )
                    board_obj = await daos.wooden_board.create(board_input)
                    wooden_board_dtos.append(WoodenBoardDTO.model_validate(board_obj))
                
                # Transaction will be committed automatically
                return ProductCreationResult(product_dto, image_dto, wooden_board_dtos)
                
        except SQLAlchemyError as e:
            # Database transaction will be rolled back automatically
            # Clean up uploaded file
            if saved_file_path:
                file_service.delete_file(saved_file_path)
            
            raise HTTPException(
                status_code=500,
                detail=f"Database error during product creation: {str(e)}"
            )
        
        except Exception as e:
            # Clean up uploaded file on any error
            if saved_file_path:
                file_service.delete_file(saved_file_path)
            
            # Re-raise HTTP exceptions as-is
            if isinstance(e, HTTPException):
                raise e
            
            raise HTTPException(
                status_code=500,
                detail=f"Unexpected error during product creation: {str(e)}"
            )
    
    async def update_product_image(
        self,
        session: AsyncSession,
        daos: AllDAOs,
        product_id: UUID,
        image_file: UploadFile,
        board_height: float,
        board_length: float,
        reanalyze_boards: bool = True
    ) -> ProductCreationResult:
        """
        Update product image and optionally re-analyze boards.
        
        Args:
            session: Database session for transaction
            daos: Data access objects
            product_id: ID of product to update
            image_file: New image file
            board_height: Board height in meters
            board_length: Board length in meters
            reanalyze_boards: Whether to re-analyze wooden boards
            
        Returns:
            ProductCreationResult with updated entities
        """
        saved_file_path = None
        old_image_path = None
        
        try:
            async with session.begin():
                # Get existing product
                product_obj = await daos.product.get_by_id(product_id)
                if not product_obj:
                    raise HTTPException(status_code=404, detail="Product not found")
                
                # Get existing image
                existing_images = await daos.image.get_by_product_id(product_id)
                if existing_images:
                    old_image_path = existing_images[0].image_path
                
                # Save new image
                saved_file_path = await file_service.save_uploaded_file(image_file, "products")
                
                # Update or create image record
                if existing_images:
                    # Update existing image
                    image_obj = existing_images[0]
                    image_obj.image_path = saved_file_path
                    await daos.image.update(image_obj.id, {"image_path": saved_file_path})
                else:
                    # Create new image record
                    image_input = ImageInputDTO(
                        image_path=saved_file_path,
                        product_id=product_id
                    )
                    image_obj = await daos.image.create(image_input)
                
                image_dto = ImageDTO.model_validate(image_obj)
                
                # Re-analyze boards if requested
                wooden_board_dtos = []
                if reanalyze_boards:
                    # Delete existing wooden boards
                    existing_boards = await daos.wooden_board.get_by_product_id(product_id)
                    for board in existing_boards:
                        await daos.wooden_board.delete(board.id)
                    
                    # Analyze new image
                    analysis_result = await self.analysis_service.analyze_image(
                        image_file, board_height, board_length
                    )
                    
                    if analysis_result and analysis_result.total_count > 0:
                        # Update product volume
                        await daos.product.update(product_id, {"volume": analysis_result.total_volume})
                        
                        # Create new wooden board records
                        for board_data in analysis_result.wooden_boards:
                            board_input = WoodenBoardInputDTO(
                                height=board_data.height,
                                width=board_data.width,
                                length=board_data.length,  # Fixed field name to match migration
                                volume=board_data.volume,
                                confidence=board_data.detection.confidence,
                                image_id=image_dto.id,
                                product_id=product_id
                            )
                            board_obj = await daos.wooden_board.create(board_input)
                            wooden_board_dtos.append(WoodenBoardDTO.model_validate(board_obj))
                
                # Get updated product
                updated_product_obj = await daos.product.get_by_id(product_id)
                product_dto = ProductDTO.model_validate(updated_product_obj)
                
                # Clean up old image file
                if old_image_path and old_image_path != saved_file_path:
                    file_service.delete_file(old_image_path)
                
                return ProductCreationResult(product_dto, image_dto, wooden_board_dtos)
                
        except Exception as e:
            # Clean up new file on error
            if saved_file_path:
                file_service.delete_file(saved_file_path)
            
            if isinstance(e, HTTPException):
                raise e
            
            raise HTTPException(
                status_code=500,
                detail=f"Error updating product image: {str(e)}"
            )
    
    async def delete_product_with_cleanup(
        self,
        session: AsyncSession,
        daos: AllDAOs,
        product_id: UUID
    ) -> bool:
        """
        Delete product and clean up associated files.
        
        Args:
            session: Database session for transaction
            daos: Data access objects
            product_id: ID of product to delete
            
        Returns:
            True if product was deleted
        """
        try:
            async with session.begin():
                # Get product images for cleanup
                images = await daos.image.filter(product_id=product_id)
                image_paths = [img.image_path for img in images] if images else []

                # Delete product (cascade will handle related records)
                await daos.product.delete(id=product_id)

                # Clean up image files
                for image_path in image_paths:
                    file_service.delete_file(image_path)

                return True
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error deleting product: {str(e)}"
            )


# Global product service instance
product_service = ProductService()
