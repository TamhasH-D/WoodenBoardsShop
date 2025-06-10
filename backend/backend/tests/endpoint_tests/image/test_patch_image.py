from uuid import UUID

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/images/{image_id}"


@pytest.mark.anyio
async def test_patch_image(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test patch Image: 200."""
    product = await factories.ProductFactory.create()
    image = await factories.ImageFactory.create()

    input_json = {
        "image_path": "world",
        "product_id": str(product.id),
    }

    response = await client.patch(URI.format(image_id=image.id), json=input_json)
    assert response.status_code == 200

    db_image = await daos.image.filter_first(id=image.id)

    assert db_image is not None
    assert db_image.image_path == input_json["image_path"]
    assert db_image.product_id == UUID(input_json["product_id"])
