import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/products/{product_id}"


@pytest.mark.anyio
async def test_delete_product(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete Product: 200."""
    product = await factories.ProductFactory.create()

    response = await client.delete(URI.format(product_id=product.id))
    assert response.status_code == 200

    db_product = await daos.product.filter_first(id=product.id)
    assert db_product is None
