"""
File management service for handling image uploads and storage.
Provides secure file upload, validation, and storage management.
"""

import uuid
from pathlib import Path
import mimetypes
from PIL import Image as PILImage
import aiofiles
from fastapi import UploadFile, HTTPException

from backend.settings import settings


class FileService:
    """Service for managing file uploads and storage."""
    
    # Allowed image types
    ALLOWED_IMAGE_TYPES = {
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp'
    }
    
    # Maximum file size (10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024
    
    # Image quality settings
    IMAGE_QUALITY = 85
    MAX_IMAGE_DIMENSION = 2048
    
    def __init__(self):
        """Initialize file service with upload directory."""
        self.upload_dir = Path(settings.UPLOAD_DIR if hasattr(settings, 'UPLOAD_DIR') else 'uploads')
        self.products_dir = self.upload_dir / 'products'
        self.temp_dir = self.upload_dir / 'temp'
        
        # Create directories if they don't exist
        self.products_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
    
    def validate_image_file(self, file: UploadFile) -> None:
        """
        Validate uploaded image file.
        
        Args:
            file: The uploaded file to validate
            
        Raises:
            HTTPException: If file validation fails
        """
        # Check file size
        if hasattr(file, 'size') and file.size and file.size > self.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File size too large. Maximum allowed: {self.MAX_FILE_SIZE // (1024*1024)}MB"
            )
        
        # Check content type
        if file.content_type not in self.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type. Allowed types: {', '.join(self.ALLOWED_IMAGE_TYPES)}"
            )
        
        # Validate file extension
        if file.filename:
            file_ext = Path(file.filename).suffix.lower()
            mime_type, _ = mimetypes.guess_type(file.filename)
            if mime_type not in self.ALLOWED_IMAGE_TYPES:
                raise HTTPException(
                    status_code=415,
                    detail=f"Invalid file extension: {file_ext}"
                )
    
    def generate_unique_filename(self, original_filename: str) -> str:
        """
        Generate a unique filename to prevent conflicts.
        
        Args:
            original_filename: Original filename from upload
            
        Returns:
            Unique filename with UUID prefix
        """
        file_ext = Path(original_filename).suffix.lower()
        unique_id = str(uuid.uuid4())
        return f"{unique_id}{file_ext}"
    
    async def save_uploaded_file(self, file: UploadFile, subdirectory: str = "products") -> str:
        """
        Save uploaded file to disk with validation and optimization.
        
        Args:
            file: The uploaded file
            subdirectory: Subdirectory within uploads folder
            
        Returns:
            Relative path to saved file
            
        Raises:
            HTTPException: If file saving fails
        """
        # Validate file
        self.validate_image_file(file)
        
        # Generate unique filename
        if not file.filename:
            raise HTTPException(status_code=400, detail="Filename is required")
        
        unique_filename = self.generate_unique_filename(file.filename)
        
        # Determine save directory
        save_dir = self.upload_dir / subdirectory
        save_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = save_dir / unique_filename
        
        try:
            # Save file to disk
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)
            
            # Optimize image
            await self._optimize_image(file_path)
            
            # Return relative path
            return f"{subdirectory}/{unique_filename}"
            
        except Exception as e:
            # Clean up file if it was created
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save file: {str(e)}"
            )
    
    async def _optimize_image(self, file_path: Path) -> None:
        """
        Optimize image file (resize and compress).
        
        Args:
            file_path: Path to image file to optimize
        """
        try:
            with PILImage.open(file_path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large
                if max(img.size) > self.MAX_IMAGE_DIMENSION:
                    img.thumbnail((self.MAX_IMAGE_DIMENSION, self.MAX_IMAGE_DIMENSION), PILImage.Resampling.LANCZOS)
                
                # Save optimized image
                img.save(file_path, 'JPEG', quality=self.IMAGE_QUALITY, optimize=True)
                
        except Exception as e:
            # If optimization fails, keep original file
            print(f"Warning: Failed to optimize image {file_path}: {e}")
    
    def delete_file(self, file_path: str) -> bool:
        """
        Delete file from disk.
        
        Args:
            file_path: Relative path to file
            
        Returns:
            True if file was deleted, False if file didn't exist
        """
        full_path = self.upload_dir / file_path
        
        try:
            if full_path.exists():
                full_path.unlink()
                return True
            return False
        except Exception as e:
            print(f"Warning: Failed to delete file {full_path}: {e}")
            return False
    
    def get_file_path(self, relative_path: str) -> Path:
        """
        Get full file path from relative path.
        
        Args:
            relative_path: Relative path to file
            
        Returns:
            Full path to file
        """
        return self.upload_dir / relative_path
    
    def file_exists(self, relative_path: str) -> bool:
        """
        Check if file exists.
        
        Args:
            relative_path: Relative path to file
            
        Returns:
            True if file exists
        """
        return self.get_file_path(relative_path).exists()
    
    def cleanup_temp_files(self, max_age_hours: int = 24) -> int:
        """
        Clean up temporary files older than specified age.
        
        Args:
            max_age_hours: Maximum age in hours before deletion
            
        Returns:
            Number of files deleted
        """
        import time
        
        deleted_count = 0
        current_time = time.time()
        max_age_seconds = max_age_hours * 3600
        
        try:
            for file_path in self.temp_dir.iterdir():
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        file_path.unlink()
                        deleted_count += 1
        except Exception as e:
            print(f"Warning: Error during temp file cleanup: {e}")
        
        return deleted_count


# Global file service instance
file_service = FileService()
