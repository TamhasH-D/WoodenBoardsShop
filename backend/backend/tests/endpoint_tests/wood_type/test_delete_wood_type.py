import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/wood-types/{wood_type_id}"


@pytest.mark.anyio
async def test_delete_wood_type(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete WoodType: 200."""
    wood_type = await factories.WoodTypeFactory.create()

    response = await client.delete(URI.format(wood_type_id=wood_type.id))
    assert response.status_code == 200

    db_wood_type = await daos.wood_type.filter_first(id=wood_type.id)
    assert db_wood_type is None
