import os
import aiofiles
from uuid import uuid4
from pathlib import Path
from fastapi import UploadFile, HTTPException
import aiohttp
from typing import Dict, Any


class ImageService:
    """Service for handling image operations."""
    
    def __init__(self, upload_dir: str = "uploads/products"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.yolo_backend_url = "http://localhost:8001"  # YOLO backend URL
    
    async def save_image(self, image: UploadFile, product_id: str) -> str:
        """Save uploaded image to filesystem."""
        try:
            # Generate unique filename
            file_extension = Path(image.filename).suffix if image.filename else '.jpg'
            filename = f"{product_id}_{uuid4()}{file_extension}"
            file_path = self.upload_dir / filename
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await image.read()
                await f.write(content)
            
            # Reset file position for potential reuse
            await image.seek(0)
            
            return str(file_path)
            
        except Exception as e:
            raise HTTPException(
                status_code=500, 
                detail=f"Ошибка сохранения изображения: {str(e)}"
            )
    
    async def analyze_wooden_boards(
        self, 
        image: UploadFile, 
        board_height: float, 
        board_length: float
    ) -> Dict[str, Any]:
        """Send image to YOLO backend for analysis."""
        try:
            # Convert mm to meters for YOLO backend
            height_m = board_height / 1000
            length_m = board_length / 1000
            
            async with aiohttp.ClientSession() as session:
                # Prepare form data
                form_data = aiohttp.FormData()
                
                # Reset file position
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
                url = f"{self.yolo_backend_url}/wooden_boards_volume_seg/"
                async with session.post(url, data=form_data) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise HTTPException(
                            status_code=500,
                            detail=f"Ошибка анализа изображения: {error_text}"
                        )
                    
                    result = await response.json()
                    
                    # Validate that boards were detected
                    if not result.get("wooden_boards") or len(result["wooden_boards"]) == 0:
                        raise HTTPException(
                            status_code=400,
                            detail="На изображении не обнаружено досок. Пожалуйста, загрузите изображение с четко видимыми досками."
                        )
                    
                    return result
                    
        except aiohttp.ClientError as e:
            raise HTTPException(
                status_code=503,
                detail=f"Сервис анализа изображений недоступен: {str(e)}"
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Неожиданная ошибка при анализе изображения: {str(e)}"
            )
    
    async def delete_image(self, image_path: str) -> None:
        """Delete image file from filesystem."""
        try:
            file_path = Path(image_path)
            if file_path.exists():
                file_path.unlink()
        except Exception as e:
            # Log error but don't raise exception for cleanup operations
            print(f"Warning: Could not delete image file {image_path}: {e}")


# Global instance
image_service = ImageService()
