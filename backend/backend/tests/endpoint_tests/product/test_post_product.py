from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/products/"


@pytest.mark.anyio
async def test_post_product(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create Product: 201."""
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()

    input_json = {
        "id": str(uuid4()),
        "volume": 2.0,
        "price": 2.0,
        "title": "world",
        "descrioption": "world",
        "delivery_possible": False,
        "pickup_location": "world",
        "seller_id": str(seller.id),
        "wood_type_id": str(wood_type.id),
    }

    response = await client.post(URI, json=input_json)
    assert response.status_code == 201

    response_data = response.json()["data"]
    db_product = await daos.product.filter_first(
        id=response_data["id"],
    )

    assert db_product is not None
    assert db_product.volume == input_json["volume"]
    assert db_product.price == input_json["price"]
    assert db_product.title == input_json["title"]
    assert db_product.descrioption == input_json["descrioption"]
    assert db_product.delivery_possible == input_json["delivery_possible"]
    assert db_product.pickup_location == input_json["pickup_location"]
    assert db_product.seller_id == UUID(input_json["seller_id"])
    assert db_product.wood_type_id == UUID(input_json["wood_type_id"])
