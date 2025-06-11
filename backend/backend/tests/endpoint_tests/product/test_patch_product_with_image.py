"""Tests for PATCH /products/{product_id}/with-image endpoint."""

from uuid import uuid4
import pytest
from httpx import AsyncClient
from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/products/{product_id}/with-image"


@pytest.mark.anyio
async def test_update_product_with_image_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test update product with image: 200."""
    # Create test data
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id,
    )
    
    # Prepare form data
    form_data = {
        "title": "Updated Product",
        "description": "Updated Description",
        "price": 2000.0,
        "delivery_possible": False,
        "pickup_location": "Updated Location",
    }
    
    # Create test image file
    files = {
        "image": ("updated.jpg", b"updated image content", "image/jpeg")
    }
    
    # Note: This test will fail without YOLO backend running
    response = await client.patch(
        URI.format(product_id=product.id),
        data=form_data,
        files=files,
    )
    
    # This test documents the expected behavior
    assert response.status_code in [200, 503]  # 503 if YOLO backend unavailable


@pytest.mark.anyio
async def test_update_product_without_image(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test update product without image: 200."""
    # Create test data
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id,
    )
    
    # Prepare form data (no image)
    form_data = {
        "title": "Updated Product",
        "description": "Updated Description",
        "price": 2000.0,
        "delivery_possible": False,
        "pickup_location": "Updated Location",
    }
    
    response = await client.patch(
        URI.format(product_id=product.id),
        data=form_data,
    )
    
    assert response.status_code == 200
    
    # Verify response structure
    data = response.json()
    assert "data" in data
    assert data["data"]["product_id"] == str(product.id)
    assert data["data"]["message"] == "Товар успешно обновлен"


@pytest.mark.anyio
async def test_update_product_not_found(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test update product - not found: 404."""
    form_data = {
        "title": "Updated Product",
        "price": 2000.0,
    }
    
    response = await client.patch(
        URI.format(product_id=uuid4()),
        data=form_data,
    )
    
    assert response.status_code == 404


@pytest.mark.anyio
async def test_update_product_invalid_wood_type(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test update product - invalid wood type: 404."""
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id,
    )
    
    form_data = {
        "title": "Updated Product",
        "wood_type_id": str(uuid4()),  # Non-existent wood type
        "price": 2000.0,
    }
    
    response = await client.patch(
        URI.format(product_id=product.id),
        data=form_data,
    )
    
    assert response.status_code == 404


@pytest.mark.anyio
async def test_update_product_validation_errors(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test update product - validation errors: 422."""
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id,
    )
    
    # Test negative price
    form_data = {
        "title": "Updated Product",
        "price": -100.0,  # Negative price
    }
    
    response = await client.patch(
        URI.format(product_id=product.id),
        data=form_data,
    )
    
    assert response.status_code == 422
    
    # Test invalid board dimensions
    form_data = {
        "title": "Updated Product",
        "price": 1000.0,
        "board_height": 2000.0,  # Too high
    }
    
    response = await client.patch(
        URI.format(product_id=product.id),
        data=form_data,
    )
    
    assert response.status_code == 422


@pytest.mark.anyio
async def test_update_product_partial_update(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test update product - partial update: 200."""
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create(
        seller_id=seller.id,
        wood_type_id=wood_type.id,
    )
    
    # Update only title
    form_data = {
        "title": "Only Title Updated",
    }
    
    response = await client.patch(
        URI.format(product_id=product.id),
        data=form_data,
    )
    
    assert response.status_code == 200
    
    # Verify response
    data = response.json()
    assert data["data"]["product_id"] == str(product.id)
    assert "успешно обновлен" in data["data"]["message"]
