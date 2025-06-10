from uuid import uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs

URI = "/api/v1/buyers/"


@pytest.mark.anyio
async def test_post_buyer(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create Buyer: 201."""
    input_json = {
        "id": str(uuid4()),
        "keycloak_uuid": str(uuid4()),
        "is_online": False,
    }

    response = await client.post(URI, json=input_json)
    assert response.status_code == 201

    response_data = response.json()["data"]
    db_buyer = await daos.buyer.filter_first(
        keycloak_uuid=response_data["keycloak_uuid"],
    )

    assert db_buyer is not None
    assert db_buyer.is_online == input_json["is_online"]
