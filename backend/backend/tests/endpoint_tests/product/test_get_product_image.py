"""Test GET /api/v1/products/{product_id}/image endpoint."""

import tempfile
from pathlib import Path
from uuid import uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/products/{product_id}/image"


@pytest.mark.anyio
async def test_get_product_image_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test get product image: 200."""
    # Create a product first
    product = await factories.ProductFactory.create()
    
    # Create a temporary image file
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
        tmp_file.write(b"fake image content")
        tmp_path = tmp_file.name
    
    try:
        # Create image record in database
        image = await factories.ImageFactory.create(
            product_id=product.id,
            image_path=tmp_path,
        )
        
        # Test getting the product image
        response = await client.get(URI.format(product_id=product.id))
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("image/")
        assert response.content == b"fake image content"
        
    finally:
        # Clean up temporary file
        Path(tmp_path).unlink(missing_ok=True)


@pytest.mark.anyio
async def test_get_product_image_product_not_found(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test get product image with non-existent product: 404."""
    non_existent_id = uuid4()
    
    response = await client.get(URI.format(product_id=non_existent_id))
    assert response.status_code == 404
    assert "не найден" in response.json()["detail"]


@pytest.mark.anyio
async def test_get_product_image_no_image(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test get product image when product has no images: 404."""
    # Create a product without images
    product = await factories.ProductFactory.create()
    
    response = await client.get(URI.format(product_id=product.id))
    assert response.status_code == 404
    assert "Изображение для товара не найдено" in response.json()["detail"]


@pytest.mark.anyio
async def test_get_product_image_missing_file(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test get product image when image file doesn't exist on filesystem: 404."""
    # Create a product first
    product = await factories.ProductFactory.create()
    
    # Create image record with non-existent file path
    image = await factories.ImageFactory.create(
        product_id=product.id,
        image_path="/non/existent/path.jpg",
    )
    
    response = await client.get(URI.format(product_id=product.id))
    assert response.status_code == 404
    assert "не найден" in response.json()["detail"]


@pytest.mark.anyio
async def test_get_product_image_multiple_images(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test get product image when product has multiple images - returns first one."""
    # Create a product first
    product = await factories.ProductFactory.create()
    
    # Create multiple temporary image files
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file1:
        tmp_file1.write(b"first image content")
        tmp_path1 = tmp_file1.name
    
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_file2:
        tmp_file2.write(b"second image content")
        tmp_path2 = tmp_file2.name
    
    try:
        # Create multiple image records
        image1 = await factories.ImageFactory.create(
            product_id=product.id,
            image_path=tmp_path1,
        )
        image2 = await factories.ImageFactory.create(
            product_id=product.id,
            image_path=tmp_path2,
        )
        
        # Test getting the product image - should return the first one
        response = await client.get(URI.format(product_id=product.id))
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("image/")
        # Should return the first image (order may depend on database)
        assert response.content in [b"first image content", b"second image content"]
        
    finally:
        # Clean up temporary files
        Path(tmp_path1).unlink(missing_ok=True)
        Path(tmp_path2).unlink(missing_ok=True)
