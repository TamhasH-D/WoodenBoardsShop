
import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/wooden-boards/{wooden_board_id}"


@pytest.mark.anyio
async def test_get_wooden_board_by_id(
    client: AsyncClient,
) -> None:
    """Test get wooden_board by id: 200."""
    wooden_board = await factories.WoodenBoardFactory.create()

    response = await client.get(URI.format(wooden_board_id=wooden_board.id))
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["id"] == str(wooden_board.id)
    assert response_data["height"] == wooden_board.height
    assert response_data["width"] == wooden_board.width
    assert response_data["lenght"] == wooden_board.lenght
    assert response_data["image_id"] == str(wooden_board.image_id)
