import io
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

URI = "/api/v1/wooden-boards/calculate-volume"


@pytest.mark.anyio
async def test_calculate_wooden_board_volume_success(
    client: AsyncClient,
) -> None:
    """Test wooden board volume calculation: 200."""
    # Create a mock image file
    image_content = b"fake_image_content"
    image_file = io.BytesIO(image_content)
    
    # Mock the WoodenBoardAnalysisService
    mock_result = AsyncMock()
    mock_result.total_volume = 0.5
    mock_result.total_count = 2
    mock_result.wooden_boards = [
        AsyncMock(
            volume=0.25,
            height=0.05,
            width=2.0,
            length=2.5,
            detection=AsyncMock(
                confidence=0.95,
                class_name="wooden_board",
                points=[[0, 0], [100, 0], [100, 50], [0, 50]]
            )
        ),
        AsyncMock(
            volume=0.25,
            height=0.05,
            width=2.0,
            length=2.5,
            detection=AsyncMock(
                confidence=0.92,
                class_name="wooden_board",
                points=[[0, 60], [100, 60], [100, 110], [0, 110]]
            )
        )
    ]
    
    with patch('backend.services.wooden_board_analysis_service.WoodenBoardAnalysisService') as mock_service:
        mock_service.return_value.analyze_image.return_value = mock_result
        
        files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
        data = {"height": 0.05, "length": 2.5}
        
        response = await client.post(URI, files=files, data=data)
        
        assert response.status_code == 200
        response_data = response.json()
        
        assert response_data["total_volume"] == 0.5
        assert response_data["total_count"] == 2
        assert len(response_data["wooden_boards"]) == 2
        
        # Check first board
        board1 = response_data["wooden_boards"][0]
        assert board1["volume"] == 0.25
        assert board1["height"] == 0.05
        assert board1["width"] == 2.0
        assert board1["length"] == 2.5
        assert board1["detection"]["confidence"] == 0.95
        assert board1["detection"]["class_name"] == "wooden_board"


@pytest.mark.anyio
async def test_calculate_wooden_board_volume_no_boards_detected(
    client: AsyncClient,
) -> None:
    """Test wooden board volume calculation when no boards detected: 200."""
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
async def test_calculate_wooden_board_volume_default_parameters(
    client: AsyncClient,
) -> None:
    """Test wooden board volume calculation with default parameters: 200."""
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
                confidence=0.88,
                class_name="wooden_board",
                points=[[0, 0], [100, 0], [100, 50], [0, 50]]
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
async def test_calculate_wooden_board_volume_missing_image(
    client: AsyncClient,
) -> None:
    """Test wooden board volume calculation without image: 422."""
    data = {"height": 0.05, "length": 1.0}
    
    response = await client.post(URI, data=data)
    
    assert response.status_code == 422  # Unprocessable Entity - missing required file
