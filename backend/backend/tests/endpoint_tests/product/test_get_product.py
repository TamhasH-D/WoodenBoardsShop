from uuid import UUID

import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/products/"


@pytest.mark.anyio
async def test_get_products(
    client: AsyncClient,
) -> None:
    """Test get Product: 200."""
    products = await factories.ProductFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for product, data in zip(products, response_data, strict=True):
        assert product.id == UUID(data["id"])
