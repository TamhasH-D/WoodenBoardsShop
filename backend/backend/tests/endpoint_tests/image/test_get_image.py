
import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/images/"


@pytest.mark.anyio
async def test_get_images(
    client: AsyncClient,
) -> None:
    """Test get Image: 200."""
    images = await factories.ImageFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for image, data in zip(images, response_data, strict=True):
        assert str(image.id) == data["id"]
