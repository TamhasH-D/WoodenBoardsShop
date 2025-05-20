from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/wooden-boards/"


@pytest.mark.anyio
async def test_post_wooden_board(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create WoodenBoard: 201."""
    image = await factories.ImageFactory.create()

    input_json = {
        "id": str(uuid4()),
        "height": 2.0,
        "width": 2.0,
        "lenght": 2.0,
        "image_id": str(image.id),
    }

    response = await client.post(URI, json=input_json)
    assert response.status_code == 201

    response_data = response.json()["data"]
    db_wooden_board = await daos.wooden_board.filter_first(
        id=response_data["id"],
    )

    assert db_wooden_board is not None
    assert db_wooden_board.height == input_json["height"]
    assert db_wooden_board.width == input_json["width"]
    assert db_wooden_board.lenght == input_json["lenght"]
    assert db_wooden_board.image_id == UUID(input_json["image_id"])
