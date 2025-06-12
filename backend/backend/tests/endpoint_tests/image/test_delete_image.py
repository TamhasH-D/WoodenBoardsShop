import tempfile
from pathlib import Path
from uuid import uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/images/{image_id}"


@pytest.mark.anyio
async def test_delete_image_success(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete Image with file cleanup: 200."""
    # Create a temporary image file
    with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp_file:
        tmp_file.write(b"fake image content")
        tmp_path = tmp_file.name

    try:
        # Create image record with real file
        image = await factories.ImageFactory.create(image_path=tmp_path)

        # Verify file exists before deletion
        assert Path(tmp_path).exists()

        # Delete image
        response = await client.delete(URI.format(image_id=image.id))
        assert response.status_code == 200

        # Verify database record is deleted
        db_image = await daos.image.filter_first(id=image.id)
        assert db_image is None

        # Verify file is deleted
        assert not Path(tmp_path).exists()

    finally:
        # Clean up in case test fails
        Path(tmp_path).unlink(missing_ok=True)


@pytest.mark.anyio
async def test_delete_image_not_found(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete non-existent Image: 404."""
    non_existent_id = uuid4()

    response = await client.delete(URI.format(image_id=non_existent_id))
    assert response.status_code == 404
    assert "не найдено" in response.json()["detail"]


@pytest.mark.anyio
async def test_delete_image_missing_file(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete Image when file doesn't exist: 200."""
    # Create image record with non-existent file path
    image = await factories.ImageFactory.create(image_path="/non/existent/path.jpg")

    # Delete should still work even if file doesn't exist
    response = await client.delete(URI.format(image_id=image.id))
    assert response.status_code == 200

    # Verify database record is deleted
    db_image = await daos.image.filter_first(id=image.id)
    assert db_image is None
