
import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/images/{image_id}"


@pytest.mark.anyio
async def test_delete_image(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete Image: 200."""
    image = await factories.ImageFactory.create()

    response = await client.delete(URI.format(image_id=image.id))
    assert response.status_code == 200

    db_image = await daos.image.filter_first(id=image.id)
    assert db_image is None
