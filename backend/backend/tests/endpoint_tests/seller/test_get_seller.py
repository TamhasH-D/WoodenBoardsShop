
import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/sellers/"


@pytest.mark.anyio
async def test_get_sellers(
    client: AsyncClient,
) -> None:
    """Test get Seller: 200."""
    sellers = await factories.SellerFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for seller, data in zip(sellers, response_data, strict=True):
        assert str(seller.keycloak_uuid) == data["keycloak_uuid"]
