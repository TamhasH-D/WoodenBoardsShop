
import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/buyers/{buyer_id}"


@pytest.mark.anyio
async def test_patch_buyer(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test patch Buyer: 200."""
    buyer = await factories.BuyerFactory.create()

    input_json = {
        "is_online": False,
    }

    response = await client.patch(
        URI.format(buyer_id=buyer.id), json=input_json
    )
    assert response.status_code == 200

    db_buyer = await daos.buyer.filter_first(keycloak_uuid=buyer.keycloak_uuid)

    assert db_buyer is not None
    assert db_buyer.is_online == input_json["is_online"]
