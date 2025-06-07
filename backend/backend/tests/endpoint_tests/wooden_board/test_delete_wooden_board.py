import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/wooden-boards/{wooden_board_id}"


@pytest.mark.anyio
async def test_delete_wooden_board(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete WoodenBoard: 200."""
    wooden_board = await factories.WoodenBoardFactory.create()

    response = await client.delete(URI.format(wooden_board_id=wooden_board.id))
    assert response.status_code == 200

    db_wooden_board = await daos.wooden_board.filter_first(id=wooden_board.id)
    assert db_wooden_board is None
