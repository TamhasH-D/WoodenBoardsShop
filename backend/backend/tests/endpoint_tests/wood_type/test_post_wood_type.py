from uuid import uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs

URI = "/api/v1/wood-types/"


@pytest.mark.anyio
async def test_post_wood_type(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create WoodType: 201."""
    input_json = {
        "id": str(uuid4()),
        "neme": "world",
        "description": "world",
    }

    response = await client.post(URI, json=input_json)
    assert response.status_code == 201

    response_data = response.json()["data"]
    db_wood_type = await daos.wood_type.filter_first(
        id=response_data["id"],
    )

    assert db_wood_type is not None
    assert db_wood_type.neme == input_json["neme"]
    assert db_wood_type.description == input_json["description"]
