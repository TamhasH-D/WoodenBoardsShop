
import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/sellers/{seller_id}"


@pytest.mark.anyio
async def test_patch_seller(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test patch Seller: 200."""
    seller = await factories.SellerFactory.create()

    input_json = {
        "is_online": False,
    }

    response = await client.patch(
        URI.format(seller_id=seller.keycloak_uuid), json=input_json
    )
    assert response.status_code == 200

    db_seller = await daos.seller.filter_first(keycloak_uuid=seller.keycloak_uuid)

    assert db_seller is not None
    assert db_seller.is_online == input_json["is_online"]
