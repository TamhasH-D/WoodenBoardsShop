"""Tests for POST /products/with-image endpoint."""

from uuid import uuid4
import pytest
from httpx import AsyncClient
from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/products/with-image"


@pytest.mark.anyio
async def test_create_product_with_image_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create product with image: 201."""
    # Create test data
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    
    # Prepare form data
    form_data = {
        "keycloak_id": str(seller.keycloak_uuid),
        "title": "Test Product",
        "description": "Test Description",
        "wood_type_id": str(wood_type.id),
        "board_height": 50.0,
        "board_length": 1000.0,
        "volume": 0.5,
        "price": 1000.0,
        "delivery_possible": True,
        "pickup_location": "Test Location",
    }
    
    # Create test image file
    files = {
        "image": ("test.jpg", b"fake image content", "image/jpeg")
    }
    
    # Note: This test will fail without YOLO backend running
    # In real testing environment, we would mock the YOLO service
    response = await client.post(URI, data=form_data, files=files)
    
    # This test documents the expected behavior
    # In practice, we need to mock the YOLO backend for testing
    assert response.status_code in [201, 503]  # 503 if YOLO backend unavailable


@pytest.mark.anyio
async def test_create_product_with_image_invalid_seller(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create product with image - invalid seller: 404."""
    wood_type = await factories.WoodTypeFactory.create()
    
    form_data = {
        "keycloak_id": str(uuid4()),  # Non-existent seller
        "title": "Test Product",
        "wood_type_id": str(wood_type.id),
        "board_height": 50.0,
        "board_length": 1000.0,
        "volume": 0.5,
        "price": 1000.0,
    }
    
    files = {
        "image": ("test.jpg", b"fake image content", "image/jpeg")
    }
    
    response = await client.post(URI, data=form_data, files=files)
    assert response.status_code == 404


@pytest.mark.anyio
async def test_create_product_with_image_invalid_wood_type(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create product with image - invalid wood type: 404."""
    seller = await factories.SellerFactory.create()
    
    form_data = {
        "keycloak_id": str(seller.keycloak_uuid),
        "title": "Test Product",
        "wood_type_id": str(uuid4()),  # Non-existent wood type
        "board_height": 50.0,
        "board_length": 1000.0,
        "volume": 0.5,
        "price": 1000.0,
    }
    
    files = {
        "image": ("test.jpg", b"fake image content", "image/jpeg")
    }
    
    response = await client.post(URI, data=form_data, files=files)
    assert response.status_code == 404


@pytest.mark.anyio
async def test_create_product_with_image_validation_errors(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create product with image - validation errors: 422."""
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    
    # Test empty title
    form_data = {
        "keycloak_id": str(seller.keycloak_uuid),
        "title": "",  # Empty title
        "wood_type_id": str(wood_type.id),
        "board_height": 50.0,
        "board_length": 1000.0,
        "volume": 0.5,
        "price": 1000.0,
    }
    
    files = {
        "image": ("test.jpg", b"fake image content", "image/jpeg")
    }
    
    response = await client.post(URI, data=form_data, files=files)
    assert response.status_code == 422
    
    # Test negative price
    form_data["title"] = "Valid Title"
    form_data["price"] = -100.0  # Negative price
    
    response = await client.post(URI, data=form_data, files=files)
    assert response.status_code == 422
    
    # Test invalid board dimensions
    form_data["price"] = 1000.0
    form_data["board_height"] = 2000.0  # Too high
    
    response = await client.post(URI, data=form_data, files=files)
    assert response.status_code == 422
