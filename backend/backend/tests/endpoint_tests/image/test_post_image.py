from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/images/"


@pytest.mark.anyio
async def test_post_image(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create Image: 201."""
    product = await factories.ProductFactory.create()

    input_json = {
        "id": str(uuid4()),
        "image_path": "world",
        "product_id": str(product.id),
    }

    response = await client.post(URI, json=input_json)
    assert response.status_code == 201

    response_data = response.json()["data"]
    db_image = await daos.image.filter_first(
        id=response_data["id"],
    )

    assert db_image is not None
    assert db_image.image_path == input_json["image_path"]
    assert db_image.product_id == UUID(input_json["product_id"])
