
import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/wood-types/{wood_type_id}"


@pytest.mark.anyio
async def test_get_wood_type_by_id(
    client: AsyncClient,
) -> None:
    """Test get wood_type by id: 200."""
    wood_type = await factories.WoodTypeFactory.create()

    response = await client.get(URI.format(wood_type_id=wood_type.id))
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["id"] == str(wood_type.id)
    assert response_data["neme"] == wood_type.neme
    assert response_data["description"] == wood_type.description
