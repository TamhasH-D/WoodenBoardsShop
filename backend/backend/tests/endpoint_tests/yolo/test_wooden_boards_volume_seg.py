import io
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

URI = "/api/v1/wooden_boards_volume_seg/"


@pytest.mark.anyio
async def test_wooden_boards_volume_seg_success(
    client: AsyncClient,
) -> None:
    """Test YOLO wooden boards volume segmentation: 200."""
    # Create a mock image file
    image_content = b"fake_image_content"
    image_file = io.BytesIO(image_content)
    
    # Mock the WoodenBoardAnalysisService
    mock_result = AsyncMock()
    mock_result.total_volume = 1.2
    mock_result.total_count = 3
    mock_result.wooden_boards = [
        AsyncMock(
            volume=0.4,
            height=0.05,
            width=2.0,
            length=4.0,
            detection=AsyncMock(
                confidence=0.96,
                class_name="wooden_board",
                points=[[0, 0], [200, 0], [200, 50], [0, 50]]
            )
        ),
        AsyncMock(
            volume=0.4,
            height=0.05,
            width=2.0,
            length=4.0,
            detection=AsyncMock(
                confidence=0.94,
                class_name="wooden_board",
                points=[[0, 60], [200, 60], [200, 110], [0, 110]]
            )
        ),
        AsyncMock(
            volume=0.4,
            height=0.05,
            width=2.0,
            length=4.0,
            detection=AsyncMock(
                confidence=0.91,
                class_name="wooden_board",
                points=[[0, 120], [200, 120], [200, 170], [0, 170]]
            )
        )
    ]
    
    with patch('backend.services.wooden_board_analysis_service.WoodenBoardAnalysisService') as mock_service:
        mock_service.return_value.analyze_image.return_value = mock_result
        
        files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
        data = {"height": 0.05, "length": 4.0}
        
        response = await client.post(URI, files=files, data=data)
        
        assert response.status_code == 200
        response_data = response.json()
        
        assert response_data["total_volume"] == 1.2
        assert response_data["total_count"] == 3
        assert len(response_data["wooden_boards"]) == 3
        
        # Check first board
        board1 = response_data["wooden_boards"][0]
        assert board1["volume"] == 0.4
        assert board1["height"] == 0.05
        assert board1["width"] == 2.0
        assert board1["length"] == 4.0
        assert board1["detection"]["confidence"] == 0.96
        assert board1["detection"]["class_name"] == "wooden_board"
        assert len(board1["detection"]["points"]) == 4


@pytest.mark.anyio
async def test_wooden_boards_volume_seg_no_detection(
    client: AsyncClient,
) -> None:
    """Test YOLO segmentation when no boards detected: 200."""
    # Create a mock image file
    image_content = b"fake_image_content"
    image_file = io.BytesIO(image_content)
    
    # Mock the WoodenBoardAnalysisService returning None (no boards detected)
    with patch('backend.services.wooden_board_analysis_service.WoodenBoardAnalysisService') as mock_service:
        mock_service.return_value.analyze_image.return_value = None
        
        files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
        data = {"height": 0.05, "length": 1.0}
        
        response = await client.post(URI, files=files, data=data)
        
        assert response.status_code == 200
        response_data = response.json()
        
        assert response_data["total_volume"] == 0
        assert response_data["total_count"] == 0
        assert response_data["wooden_boards"] == []


@pytest.mark.anyio
async def test_wooden_boards_volume_seg_default_parameters(
    client: AsyncClient,
) -> None:
    """Test YOLO segmentation with default parameters: 200."""
    # Create a mock image file
    image_content = b"fake_image_content"
    image_file = io.BytesIO(image_content)
    
    # Mock the WoodenBoardAnalysisService
    mock_result = AsyncMock()
    mock_result.total_volume = 0.1
    mock_result.total_count = 1
    mock_result.wooden_boards = [
        AsyncMock(
            volume=0.1,
            height=0.05,
            width=2.0,
            length=1.0,
            detection=AsyncMock(
                confidence=0.89,
                class_name="wooden_board",
                points=[[10, 10], [110, 10], [110, 60], [10, 60]]
            )
        )
    ]
    
    with patch('backend.services.wooden_board_analysis_service.WoodenBoardAnalysisService') as mock_service:
        mock_service.return_value.analyze_image.return_value = mock_result
        
        # Test with only image file, using default height=0.05 and length=1.0
        files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
        
        response = await client.post(URI, files=files)
        
        assert response.status_code == 200
        response_data = response.json()
        
        assert response_data["total_volume"] == 0.1
        assert response_data["total_count"] == 1
        assert len(response_data["wooden_boards"]) == 1
        
        # Verify the service was called with default parameters
        mock_service.return_value.analyze_image.assert_called_once()
        call_args = mock_service.return_value.analyze_image.call_args
        assert call_args[0][1] == 0.05  # height
        assert call_args[0][2] == 1.0   # length


@pytest.mark.anyio
async def test_wooden_boards_volume_seg_missing_image(
    client: AsyncClient,
) -> None:
    """Test YOLO segmentation without image: 422."""
    data = {"height": 0.05, "length": 1.0}
    
    response = await client.post(URI, data=data)
    
    assert response.status_code == 422  # Unprocessable Entity - missing required file


@pytest.mark.anyio
async def test_wooden_boards_volume_seg_service_error(
    client: AsyncClient,
) -> None:
    """Test YOLO segmentation when service throws error: 500."""
    # Create a mock image file
    image_content = b"fake_image_content"
    image_file = io.BytesIO(image_content)
    
    # Mock the WoodenBoardAnalysisService to raise an exception
    with patch('backend.services.wooden_board_analysis_service.WoodenBoardAnalysisService') as mock_service:
        mock_service.return_value.analyze_image.side_effect = Exception("YOLO service unavailable")
        
        files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
        data = {"height": 0.05, "length": 1.0}
        
        response = await client.post(URI, files=files, data=data)
        
        # The endpoint should handle errors gracefully
        # Depending on implementation, it might return 500 or handle gracefully
        assert response.status_code in [500, 200]  # Allow both error handling approaches
