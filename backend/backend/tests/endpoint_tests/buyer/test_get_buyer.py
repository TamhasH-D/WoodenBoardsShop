from uuid import UUID

import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/buyers/"


@pytest.mark.anyio
async def test_get_buyers(
    client: AsyncClient,
) -> None:
    """Test get Buyer: 200."""
    buyers = await factories.BuyerFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for buyer, data in zip(buyers, response_data, strict=True):
        assert str(buyer.keycloak_uuid) == data["keycloak_uuid"]
