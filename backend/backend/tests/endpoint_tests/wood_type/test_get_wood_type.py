
import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/wood-types/"


@pytest.mark.anyio
async def test_get_wood_types(
    client: AsyncClient,
) -> None:
    """Test get WoodType: 200."""
    wood_types = await factories.WoodTypeFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for wood_type, data in zip(wood_types, response_data, strict=True):
        assert str(wood_type.id) == data["id"]
