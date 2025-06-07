import io
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/products/with-image"


@pytest.mark.anyio
async def test_post_product_with_image_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create product with image analysis: 201."""
    # Create required dependencies
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    
    # Create a mock image file
    image_content = b"fake_image_content"
    image_file = io.BytesIO(image_content)
    
    # Mock the product service result
    mock_result = AsyncMock()
    mock_result.product = AsyncMock()
    mock_result.product.model_dump.return_value = {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Test Product",
        "volume": 0.5,
        "price": 100.0,
        "delivery_possible": True
    }
    mock_result.image = AsyncMock()
    mock_result.image.model_dump.return_value = {
        "id": "456e7890-e12b-34c5-d678-901234567890",
        "image_path": "/uploads/test_image.jpg"
    }
    mock_result.wooden_boards = [AsyncMock()]
    mock_result.wooden_boards[0].model_dump.return_value = {
        "id": "789e0123-e45f-67g8-h901-234567890123",
        "volume": 0.5,
        "height": 0.05,
        "width": 2.0,
        "lenght": 5.0
    }
    mock_result.total_volume = 0.5
    mock_result.board_count = 1
    
    with patch('backend.services.product_service.create_product_with_image_analysis') as mock_service:
        mock_service.return_value = mock_result
        
        files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
        data = {
            "title": "Test Product",
            "description": "Test description",
            "price": 100.0,
            "delivery_possible": True,
            "pickup_location": "Test location",
            "seller_id": str(seller.id),
            "wood_type_id": str(wood_type.id),
            "board_height": 0.05,
            "board_length": 5.0
        }
        
        response = await client.post(URI, files=files, data=data)
        
        assert response.status_code == 201
        response_data = response.json()["data"]
        
        assert "product" in response_data
        assert "image" in response_data
        assert "wooden_boards" in response_data
        assert "total_volume" in response_data
        assert "board_count" in response_data
        
        assert response_data["total_volume"] == 0.5
        assert response_data["board_count"] == 1


@pytest.mark.anyio
async def test_post_product_with_image_missing_required_fields(
    client: AsyncClient,
) -> None:
    """Test create product with image missing required fields: 422."""
    # Create a mock image file
    image_content = b"fake_image_content"
    image_file = io.BytesIO(image_content)
    
    files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
    data = {
        "title": "Test Product",
        # Missing required fields: price, seller_id, wood_type_id, board_height, board_length
    }
    
    response = await client.post(URI, files=files, data=data)
    
    assert response.status_code == 422  # Unprocessable Entity


@pytest.mark.anyio
async def test_post_product_with_image_missing_image(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create product with image without image file: 422."""
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    
    data = {
        "title": "Test Product",
        "price": 100.0,
        "seller_id": str(seller.id),
        "wood_type_id": str(wood_type.id),
        "board_height": 0.05,
        "board_length": 5.0
    }
    
    response = await client.post(URI, data=data)
    
    assert response.status_code == 422  # Unprocessable Entity - missing required file


@pytest.mark.anyio
async def test_post_product_with_image_invalid_seller(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create product with image with invalid seller: 422."""
    wood_type = await factories.WoodTypeFactory.create()
    
    # Create a mock image file
    image_content = b"fake_image_content"
    image_file = io.BytesIO(image_content)
    
    files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
    data = {
        "title": "Test Product",
        "price": 100.0,
        "seller_id": "invalid-uuid",  # Invalid UUID
        "wood_type_id": str(wood_type.id),
        "board_height": 0.05,
        "board_length": 5.0
    }
    
    response = await client.post(URI, files=files, data=data)
    
    assert response.status_code == 422  # Unprocessable Entity


@pytest.mark.anyio
async def test_post_product_with_image_service_error(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create product with image when service fails: 500."""
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    
    # Create a mock image file
    image_content = b"fake_image_content"
    image_file = io.BytesIO(image_content)
    
    with patch('backend.services.product_service.create_product_with_image_analysis') as mock_service:
        mock_service.side_effect = Exception("Service error")
        
        files = {"image": ("test_image.jpg", image_file, "image/jpeg")}
        data = {
            "title": "Test Product",
            "price": 100.0,
            "seller_id": str(seller.id),
            "wood_type_id": str(wood_type.id),
            "board_height": 0.05,
            "board_length": 5.0
        }
        
        response = await client.post(URI, files=files, data=data)
        
        assert response.status_code == 500  # Internal Server Error
