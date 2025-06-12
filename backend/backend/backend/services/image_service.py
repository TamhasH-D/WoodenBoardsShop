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
        self.upload_dir = settings.products_uploads_path
        self.upload_dir.mkdir(parents=True, exist_ok=True)

    async def save_image_file(
        self,
        image: UploadFile,
        product_id: UUID,
        image_id: UUID | None = None,
    ) -> str:
        """
        Save uploaded image file to filesystem.
        
        Args:
            image: Uploaded file
            product_id: Product UUID for filename
            image_id: Optional image UUID for filename
            
        Returns:
            str: Path to saved file
            
        Raises:
            HTTPException: If file save fails
        """
        try:
            # Generate unique filename
            file_extension = Path(image.filename).suffix if image.filename else ".jpg"
            unique_id = image_id or uuid4()
            filename = f"{product_id}_{unique_id}{file_extension}"
            file_path = self.upload_dir / filename

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

    def delete_image_file(self, image_path: str) -> bool:
        """
        Delete image file from filesystem.
        
        Args:
            image_path: Path to image file
            
        Returns:
            bool: True if file was deleted, False if file didn't exist
        """
        try:
            file_path = Path(image_path)
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception:
            # Log error but don't raise - file deletion is not critical
            return False

    def get_image_file_path(self, image_path: str) -> Path:
        """
        Get Path object for image file.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Path: Path object for the file
            
        Raises:
            HTTPException: If file doesn't exist
        """
        file_path = Path(image_path)
        
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
