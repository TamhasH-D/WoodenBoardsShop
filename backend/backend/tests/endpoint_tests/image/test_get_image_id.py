import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/images/{image_id}"


@pytest.mark.anyio
async def test_get_image_by_id(
    client: AsyncClient,
) -> None:
    """Test get image by id: 200."""
    image = await factories.ImageFactory.create()

    response = await client.get(URI.format(image_id=image.id))
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["id"] == str(image.id)
    assert response_data["image_path"] == image.image_path
    assert response_data["product_id"] == str(image.product_id)
