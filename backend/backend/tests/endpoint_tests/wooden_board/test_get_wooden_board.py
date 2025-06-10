import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/wooden-boards/"


@pytest.mark.anyio
async def test_get_wooden_boards(
    client: AsyncClient,
) -> None:
    """Test get WoodenBoard: 200."""
    wooden_boards = await factories.WoodenBoardFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for wooden_board, data in zip(wooden_boards, response_data, strict=True):
        assert str(wooden_board.id) == data["id"]
