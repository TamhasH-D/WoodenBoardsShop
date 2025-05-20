from uuid import UUID

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/wood-type-prices/{wood_type_price_id}"


@pytest.mark.anyio
async def test_patch_wood_type_price(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test patch WoodTypePrice: 200."""
    wood_type = await factories.WoodTypePriceFactory.create()
    wood_type_price = await factories.WoodTypePriceFactory.create()

    input_json = {
        "price_per_m3": 2.0,
        "wood_type_id": str(wood_type.id),
    }

    response = await client.patch(
        URI.format(wood_type_price_id=wood_type_price.id), json=input_json
    )
    assert response.status_code == 200

    db_wood_type_price = await daos.wood_type_price.filter_first(id=wood_type_price.id)

    assert db_wood_type_price is not None
    assert db_wood_type_price.price_per_m3 == input_json["price_per_m3"]
    assert db_wood_type_price.wood_type_id == UUID(input_json["wood_type_id"])
