from uuid import uuid4
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch
import io

from backend.daos import AllDAOs

URI = "/api/v1/products/with-analysis"


@pytest.mark.anyio
async def test_create_product_with_analysis_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create Product with analysis: 201."""
    
    # Create test seller
    seller_id = uuid4()
    keycloak_uuid = uuid4()
    seller_data = {
        "id": seller_id,
        "keycloak_uuid": keycloak_uuid,
        "is_online": True,
    }
    await daos.seller.create(seller_data)
    
    # Create test wood type
    wood_type_id = uuid4()
    wood_type_data = {
        "id": wood_type_id,
        "neme": "Test Wood",
        "description": "Test wood type",
    }
    await daos.wood_type.create(wood_type_data)
    
    # Mock YOLO backend response
    mock_analysis_result = {
        "total_volume": 0.5,
        "total_count": 3,
        "wooden_boards": [
            {
                "volume": 0.15,
                "height": 0.05,
                "width": 0.1,
                "length": 1.0,
                "detection": {
                    "confidence": 0.95,
                    "class_name": "board",
                    "points": [{"x": 10, "y": 10}, {"x": 100, "y": 100}]
                }
            },
            {
                "volume": 0.15,
                "height": 0.05,
                "width": 0.1,
                "length": 1.0,
                "detection": {
                    "confidence": 0.92,
                    "class_name": "board",
                    "points": [{"x": 20, "y": 20}, {"x": 120, "y": 120}]
                }
            },
            {
                "volume": 0.2,
                "height": 0.05,
                "width": 0.1,
                "length": 1.0,
                "detection": {
                    "confidence": 0.88,
                    "class_name": "board",
                    "points": [{"x": 30, "y": 30}, {"x": 130, "y": 130}]
                }
            }
        ]
    }
    
    # Create test image file
    image_content = b"fake image content"
    image_file = io.BytesIO(image_content)
    
    # Prepare form data
    form_data = {
        "keycloak_id": str(keycloak_uuid),
        "title": "Test Product",
        "description": "Test product description",
        "wood_type_id": str(wood_type_id),
        "board_height": 50.0,
        "board_length": 1000.0,
        "volume": 0.5,
        "price": 1500.0,
        "delivery_possible": True,
        "pickup_location": "Test Location",
    }
    
    files = {
        "image": ("test.jpg", image_file, "image/jpeg")
    }
    
    # Mock the YOLO backend HTTP call
    with patch("aiohttp.ClientSession.post") as mock_post:
        # Mock response
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = mock_analysis_result
        mock_post.return_value.__aenter__.return_value = mock_response

        # Mock file operations
        with patch("aiofiles.open"), patch("pathlib.Path.mkdir"):
            # Make request
            response = await client.post(URI, data=form_data, files=files)
    
    assert response.status_code == 201
    
    response_data = response.json()["data"]
    assert "product_id" in response_data
    assert "seller_id" in response_data
    assert "image_id" in response_data
    assert response_data["wooden_boards_count"] == 3
    assert response_data["total_volume"] == 0.5
    assert "успешно создан" in response_data["message"]


@pytest.mark.anyio
async def test_create_product_with_analysis_seller_not_found(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create Product with analysis when seller not found: 404."""
    
    non_existent_keycloak_uuid = uuid4()
    wood_type_id = uuid4()
    
    # Create test wood type
    wood_type_data = {
        "id": wood_type_id,
        "neme": "Test Wood",
        "description": "Test wood type",
    }
    await daos.wood_type.create(wood_type_data)
    
    # Create test image file
    image_content = b"fake image content"
    image_file = io.BytesIO(image_content)
    
    form_data = {
        "keycloak_id": str(non_existent_keycloak_uuid),
        "title": "Test Product",
        "wood_type_id": str(wood_type_id),
        "board_height": 50.0,
        "board_length": 1000.0,
        "volume": 0.5,
        "price": 1500.0,
    }
    
    files = {
        "image": ("test.jpg", image_file, "image/jpeg")
    }
    
    response = await client.post(URI, data=form_data, files=files)
    
    assert response.status_code == 404
    assert "keycloak_id не найден" in response.json()["detail"]


@pytest.mark.anyio
async def test_create_product_with_analysis_no_boards_detected(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create Product with analysis when no boards detected: 400."""
    
    # Create test seller
    seller_id = uuid4()
    keycloak_uuid = uuid4()
    seller_data = {
        "id": seller_id,
        "keycloak_uuid": keycloak_uuid,
        "is_online": True,
    }
    await daos.seller.create(seller_data)
    
    # Create test wood type
    wood_type_id = uuid4()
    wood_type_data = {
        "id": wood_type_id,
        "neme": "Test Wood",
        "description": "Test wood type",
    }
    await daos.wood_type.create(wood_type_data)
    
    # Mock YOLO backend response with no boards
    mock_analysis_result = {
        "total_volume": 0.0,
        "total_count": 0,
        "wooden_boards": []
    }
    
    # Create test image file
    image_content = b"fake image content"
    image_file = io.BytesIO(image_content)
    
    form_data = {
        "keycloak_id": str(keycloak_uuid),
        "title": "Test Product",
        "wood_type_id": str(wood_type_id),
        "board_height": 50.0,
        "board_length": 1000.0,
        "volume": 0.5,
        "price": 1500.0,
    }
    
    files = {
        "image": ("test.jpg", image_file, "image/jpeg")
    }
    
    # Mock the YOLO backend HTTP call
    with patch("aiohttp.ClientSession.post") as mock_post:
        # Mock response with no boards
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = mock_analysis_result
        mock_post.return_value.__aenter__.return_value = mock_response

        response = await client.post(URI, data=form_data, files=files)
    
    assert response.status_code == 400
    assert "не обнаружено досок" in response.json()["detail"]
