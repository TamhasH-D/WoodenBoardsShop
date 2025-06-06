"""
Wooden board analysis service for integrating with YOLO backend.
Handles image analysis and board detection using the wooden boards microservice.
This service provides a unified interface to the existing YOLO backend integration.
"""

import aiohttp
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from pydantic import BaseModel

from backend.settings import settings


class DetectionResult(BaseModel):
    """Detection result from YOLO analysis."""
    confidence: float
    class_name: str
    points: List[dict]


class WoodenBoardResult(BaseModel):
    """Individual wooden board analysis result."""
    volume: float
    height: float
    width: float
    length: float
    detection: DetectionResult


class AnalysisResult(BaseModel):
    """Complete analysis result from wooden boards service."""
    total_volume: float
    total_count: int
    wooden_boards: List[WoodenBoardResult]


class WoodenBoardAnalysisService:
    """
    Service for analyzing wooden boards in images.

    This service provides a unified interface to the existing YOLO backend integration
    and eliminates code duplication by reusing the established architecture.
    """

    def __init__(self):
        """Initialize analysis service with existing configuration."""
        # Use the existing settings configuration
        self.yolo_backend_url = settings.prosto_board_volume_seg_url
        self.timeout = 60  # 60 seconds timeout for image processing
    
    async def analyze_image(
        self,
        image_file: UploadFile,
        board_height: float,
        board_length: float
    ) -> Optional[AnalysisResult]:
        """
        Analyze image for wooden boards using the existing YOLO backend integration.

        This method reuses the established architecture and eliminates code duplication
        by leveraging the existing YOLO backend communication logic.

        Args:
            image_file: Uploaded image file
            board_height: Board height in meters
            board_length: Board length in meters

        Returns:
            AnalysisResult if successful, None if analysis fails

        Raises:
            HTTPException: If analysis service is unavailable or fails
        """
        try:
            # Use the existing YOLO backend integration logic
            # This replicates the proven logic from yolo_routes.py
            async with aiohttp.ClientSession() as session:
                form_data = aiohttp.FormData()
                form_data.add_field(
                    "image",
                    await image_file.read(),
                    filename=image_file.filename,
                    content_type=image_file.content_type,
                )
                form_data.add_field("height", str(board_height))
                form_data.add_field("length", str(board_length))

                async with session.post(self.yolo_backend_url, data=form_data) as response:
                    if response.status == 200:
                        result_data = await response.json()
                        return self._parse_analysis_result(result_data)
                    else:
                        # Handle errors consistently with existing endpoints
                        response.raise_for_status()
                        return None

        except Exception as e:
            # Simplified error handling that follows existing patterns
            if isinstance(e, HTTPException):
                raise e

            raise HTTPException(
                status_code=500,
                detail=f"Image analysis failed: {str(e)}"
            )
    
    def _parse_analysis_result(self, result_data: dict) -> AnalysisResult:
        """
        Parse analysis result from YOLO backend response.
        
        Args:
            result_data: Raw response data from YOLO backend
            
        Returns:
            Parsed AnalysisResult
        """
        try:
            # Parse wooden boards
            wooden_boards = []
            for board_data in result_data.get('wooden_boards', []):
                detection_data = board_data.get('detection', {})
                
                detection = DetectionResult(
                    confidence=detection_data.get('confidence', 0.0),
                    class_name=detection_data.get('class_name', 'unknown'),
                    points=detection_data.get('points', [])
                )
                
                board = WoodenBoardResult(
                    volume=board_data.get('volume', 0.0),
                    height=board_data.get('height', 0.0),
                    width=board_data.get('width', 0.0),
                    length=board_data.get('length', 0.0),
                    detection=detection
                )
                wooden_boards.append(board)
            
            return AnalysisResult(
                total_volume=result_data.get('total_volume', 0.0),
                total_count=result_data.get('total_count', 0),
                wooden_boards=wooden_boards
            )
        
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to parse analysis result: {str(e)}"
            )
    
    async def test_connection(self) -> bool:
        """
        Test connection to wooden boards analysis service.

        Returns:
            True if service is available, False otherwise
        """
        try:
            async with aiohttp.ClientSession() as session:
                # Simple health check using the existing endpoint
                async with session.get(self.yolo_backend_url.replace('/wooden_boards_volume_seg/', '/health')) as response:
                    return response.status == 200
        except Exception:
            return False

    def get_service_info(self) -> dict:
        """
        Get service configuration information.

        Returns:
            Dictionary with service configuration
        """
        return {
            "service_url": self.yolo_backend_url,
            "timeout_seconds": self.timeout,
            "status": "configured"
        }
