import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/buyers/{buyer_id}"


@pytest.mark.anyio
async def test_get_buyer_by_id(
    client: AsyncClient,
) -> None:
    """Test get buyer by id: 200."""
    buyer = await factories.BuyerFactory.create()

    response = await client.get(URI.format(buyer_id=buyer.id))
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["id"] == str(buyer.id)
    assert response_data["keycloak_uuid"] == str(buyer.keycloak_uuid)
    # Remove Z suffix from response date if present
    created_at = response_data["created_at"].rstrip("Z")
    updated_at = response_data["updated_at"].rstrip("Z")
    assert created_at == buyer.created_at.isoformat()
    assert updated_at == buyer.updated_at.isoformat()
    assert response_data["is_online"] == buyer.is_online
