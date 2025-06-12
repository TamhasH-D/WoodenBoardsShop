"""Test GET /api/v1/images/{image_id}/file endpoint."""

import tempfile
from pathlib import Path
from uuid import uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/images"


@pytest.mark.anyio
async def test_get_image_file_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test get image file: 200."""
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
        
        # Test getting the file
        response = await client.get(f"{URI}/{image.id}/file")
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("image/")
        assert response.content == b"fake image content"
        
    finally:
        # Clean up temporary file
        Path(tmp_path).unlink(missing_ok=True)


@pytest.mark.anyio
async def test_get_image_file_not_found(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test get image file with non-existent image: 404."""
    non_existent_id = uuid4()
    
    response = await client.get(f"{URI}/{non_existent_id}/file")
    assert response.status_code == 404
    assert "не найдено" in response.json()["detail"]


@pytest.mark.anyio
async def test_get_image_file_missing_file(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test get image file when file doesn't exist on filesystem: 404."""
    # Create a product first
    product = await factories.ProductFactory.create()
    
    # Create image record with non-existent file path
    image = await factories.ImageFactory.create(
        product_id=product.id,
        image_path="/non/existent/path.jpg",
    )
    
    response = await client.get(f"{URI}/{image.id}/file")
    assert response.status_code == 404
    assert "не найден" in response.json()["detail"]
