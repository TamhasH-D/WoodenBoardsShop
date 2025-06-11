"""Test POST /api/v1/images/upload endpoint."""

import tempfile
from io import BytesIO
from pathlib import Path
from uuid import uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/images/upload"


@pytest.mark.anyio
async def test_upload_image_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test upload image: 201."""
    # Create a product first
    product = await factories.ProductFactory.create()
    
    # Create fake image content
    image_content = b"fake jpeg content"
    
    # Upload image
    files = {
        "image": ("test.jpg", BytesIO(image_content), "image/jpeg")
    }
    params = {"product_id": str(product.id)}
    
    response = await client.post(URI, files=files, params=params)
    assert response.status_code == 201
    
    response_data = response.json()["data"]
    
    # Verify response structure
    assert "id" in response_data
    assert "image_path" in response_data
    assert response_data["product_id"] == str(product.id)
    
    # Verify database record
    image_id = response_data["id"]
    db_image = await daos.image.filter_first(id=image_id)
    assert db_image is not None
    assert db_image.product_id == product.id
    
    # Verify file was saved
    file_path = Path(response_data["image_path"])
    assert file_path.exists()
    
    # Clean up
    file_path.unlink(missing_ok=True)


@pytest.mark.anyio
async def test_upload_image_invalid_product(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test upload image with non-existent product: 500."""
    non_existent_product_id = uuid4()
    
    # Create fake image content
    image_content = b"fake jpeg content"
    
    # Upload image
    files = {
        "image": ("test.jpg", BytesIO(image_content), "image/jpeg")
    }
    params = {"product_id": str(non_existent_product_id)}
    
    response = await client.post(URI, files=files, params=params)
    # Should fail due to foreign key constraint
    assert response.status_code == 500


@pytest.mark.anyio
async def test_upload_image_invalid_file_type(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test upload image with invalid file type: 415."""
    # Create a product first
    product = await factories.ProductFactory.create()
    
    # Create fake text content
    text_content = b"this is not an image"
    
    # Upload text file as image
    files = {
        "image": ("test.txt", BytesIO(text_content), "text/plain")
    }
    params = {"product_id": str(product.id)}
    
    response = await client.post(URI, files=files, params=params)
    assert response.status_code == 415
    assert "Неподдерживаемый тип файла" in response.json()["detail"]


@pytest.mark.anyio
async def test_upload_image_large_file(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test upload image with large file: 413."""
    # Create a product first
    product = await factories.ProductFactory.create()
    
    # Create large fake image content (11MB)
    large_content = b"x" * (11 * 1024 * 1024)
    
    # Upload large file
    files = {
        "image": ("large.jpg", BytesIO(large_content), "image/jpeg")
    }
    params = {"product_id": str(product.id)}
    
    response = await client.post(URI, files=files, params=params)
    assert response.status_code == 413
    assert "превышает" in response.json()["detail"]
