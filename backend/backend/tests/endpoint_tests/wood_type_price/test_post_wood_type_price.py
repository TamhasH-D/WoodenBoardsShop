from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/wood-type-prices/"


@pytest.mark.anyio
async def test_post_wood_type_price(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create WoodTypePrice: 201."""
    wood_type = await factories.WoodTypePriceFactory.create()

    input_json = {
        "id": str(uuid4()),
        "price_per_m3": 2.0,
        "wood_type_id": str(wood_type.id),
    }

    response = await client.post(URI, json=input_json)
    assert response.status_code == 201

    response_data = response.json()["data"]
    db_wood_type_price = await daos.wood_type_price.filter_first(
        id=response_data["id"],
    )

    assert db_wood_type_price is not None
    assert db_wood_type_price.price_per_m3 == input_json["price_per_m3"]
    assert db_wood_type_price.wood_type_id == UUID(input_json["wood_type_id"])
