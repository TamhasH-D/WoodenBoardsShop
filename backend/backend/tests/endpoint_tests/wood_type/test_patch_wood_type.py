import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/wood-types/{wood_type_id}"


@pytest.mark.anyio
async def test_patch_wood_type(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test patch WoodType: 200."""
    wood_type = await factories.WoodTypeFactory.create()

    input_json = {
        "neme": "world",
        "description": "world",
    }

    response = await client.patch(
        URI.format(wood_type_id=wood_type.id), json=input_json
    )
    assert response.status_code == 200

    db_wood_type = await daos.wood_type.filter_first(id=wood_type.id)

    assert db_wood_type is not None
    assert db_wood_type.neme == input_json["neme"]
    assert db_wood_type.description == input_json["description"]
