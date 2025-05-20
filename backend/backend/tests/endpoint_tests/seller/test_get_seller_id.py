
import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/sellers/{seller_id}"


@pytest.mark.anyio
async def test_get_seller_by_id(
    client: AsyncClient,
) -> None:
    """Test get seller by id: 200."""
    seller = await factories.SellerFactory.create()

    response = await client.get(URI.format(seller_id=seller.keycloak_uuid))
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["keycloak_uuid"] == str(seller.keycloak_uuid)
    assert response_data["created_at"] == seller.created_at.isoformat()
    assert response_data["updated_at"] == seller.updated_at.isoformat()
    assert response_data["is_online"] == seller.is_online
