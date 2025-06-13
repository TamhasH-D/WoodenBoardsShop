"""Image service for file operations."""

import contextlib
from pathlib import Path
from uuid import UUID, uuid4

import aiofiles
from fastapi import HTTPException, UploadFile

from backend.settings import settings


class ImageService:
    """Service for handling image file operations."""

    def __init__(self):
        """Initialize image service."""
        self.base_upload_dir = settings.uploads_path
        self.base_upload_dir.mkdir(parents=True, exist_ok=True)

    async def save_image_file(
        self,
        image: UploadFile,
        product_id: UUID,
        seller_id: UUID,
        image_id: UUID | None = None,
    ) -> str:
        """
        Save uploaded image file to filesystem in seller/product hierarchy.

        Args:
            image: Uploaded file
            product_id: Product UUID for directory structure
            seller_id: Seller UUID for directory structure
            image_id: Optional image UUID for filename

        Returns:
            str: Path to saved file

        Raises:
            HTTPException: If file save fails
        """
        try:
            # Create directory structure: /uploads/sellers/{seller_id}/products/{product_id}/
            seller_dir = self.base_upload_dir / "sellers" / str(seller_id)
            product_dir = seller_dir / "products" / str(product_id)
            product_dir.mkdir(parents=True, exist_ok=True)

            # Generate unique filename
            file_extension = Path(image.filename).suffix if image.filename else ".jpg"
            unique_id = image_id or uuid4()
            filename = f"{unique_id}{file_extension}"
            file_path = product_dir / filename

            # Reset file position and save
            await image.seek(0)
            async with aiofiles.open(file_path, "wb") as f:
                content = await image.read()
                await f.write(content)

            return str(file_path)

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Ошибка сохранения изображения: {e!s}",
            ) from e

    def get_seller_product_dir(self, seller_id: UUID, product_id: UUID) -> Path:
        """
        Get directory path for seller's product images.

        Args:
            seller_id: Seller UUID
            product_id: Product UUID

        Returns:
            Path: Directory path for the product's images
        """
        return self.base_upload_dir / "sellers" / str(seller_id) / "products" / str(product_id)

    def delete_image_file(self, image_path: str) -> bool:
        """
        Delete image file from filesystem and clean up empty directories.

        Args:
            image_path: Path to image file

        Returns:
            bool: True if file was deleted, False if file didn't exist
        """
        try:
            file_path = Path(image_path)
            if file_path.exists():
                file_path.unlink()
                # Clean up empty directories after deletion
                self.cleanup_empty_directories(image_path)
                return True
            return False
        except Exception:
            # Log error but don't raise - file deletion is not critical
            return False

    def cleanup_empty_directories(self, image_path: str) -> None:
        """
        Clean up empty directories after file deletion.

        Args:
            image_path: Path to the deleted image file
        """
        try:
            file_path = Path(image_path)

            # Try to remove empty directories up the hierarchy
            # Start with the product directory
            product_dir = file_path.parent
            if product_dir.exists() and not any(product_dir.iterdir()):
                product_dir.rmdir()

                # Try to remove empty products directory
                products_dir = product_dir.parent
                if products_dir.exists() and products_dir.name == "products" and not any(products_dir.iterdir()):
                    products_dir.rmdir()

                    # Try to remove empty seller directory
                    seller_dir = products_dir.parent
                    if seller_dir.exists() and not any(seller_dir.iterdir()):
                        seller_dir.rmdir()

        except Exception:
            # Ignore cleanup errors - not critical
            pass

    def get_image_file_path(self, image_path: str) -> Path:
        """
        Get Path object for image file.

        Args:
            image_path: Path to image file (can be relative to uploads_path or absolute)

        Returns:
            Path: Path object for the file

        Raises:
            HTTPException: If file doesn't exist
        """
        file_path = Path(image_path)

        # If path is not absolute, make it relative to uploads_path
        if not file_path.is_absolute():
            file_path = self.base_upload_dir / file_path

        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Файл изображения не найден",
            )

        return file_path

    def validate_image_file(self, image: UploadFile) -> None:
        """
        Validate uploaded image file.
        
        Args:
            image: Uploaded file to validate
            
        Raises:
            HTTPException: If file is invalid
        """
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if hasattr(image, 'size') and image.size and image.size > max_size:
            raise HTTPException(
                status_code=413,
                detail="Размер файла превышает 10MB",
            )

        # Check file type
        allowed_types = {
            "image/jpeg",
            "image/jpg", 
            "image/png",
            "image/webp",
        }
        
        if image.content_type not in allowed_types:
            raise HTTPException(
                status_code=415,
                detail=f"Неподдерживаемый тип файла: {image.content_type}. "
                       f"Разрешены: {', '.join(allowed_types)}",
            )

    async def cleanup_orphaned_files(self) -> int:
        """
        Clean up orphaned image files (files without DB records).
        
        Returns:
            int: Number of files cleaned up
        """
        # This would require database access, so it should be implemented
        # in a higher layer that has access to DAOs
        # For now, just return 0
        return 0


# Global instance
image_service = ImageService()
