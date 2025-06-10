from uuid import UUID

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/wooden-boards/{wooden_board_id}"


@pytest.mark.anyio
async def test_patch_wooden_board(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test patch WoodenBoard: 200."""
    image = await factories.ImageFactory.create()
    wooden_board = await factories.WoodenBoardFactory.create()

    input_json = {
        "height": 2.0,
        "width": 2.0,
        "lenght": 2.0,
        "image_id": str(image.id),
    }

    response = await client.patch(
        URI.format(wooden_board_id=wooden_board.id), json=input_json
    )
    assert response.status_code == 200

    db_wooden_board = await daos.wooden_board.filter_first(id=wooden_board.id)

    assert db_wooden_board is not None
    assert db_wooden_board.height == input_json["height"]
    assert db_wooden_board.width == input_json["width"]
    assert db_wooden_board.lenght == input_json["lenght"]
    assert db_wooden_board.image_id == UUID(input_json["image_id"])
