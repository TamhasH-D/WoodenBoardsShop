from uuid import UUID

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/products/{product_id}"


@pytest.mark.anyio
async def test_patch_product(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test patch Product: 200."""
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create()
    product = await factories.ProductFactory.create()

    input_json = {
        "volume": 2.0,
        "price": 2.0,
        "title": "world",
        "descrioption": "world",
        "delivery_possible": False,
        "pickup_location": "world",
        "seller_id": str(seller.id),
        "wood_type_id": str(wood_type.id),
    }

    response = await client.patch(URI.format(product_id=product.id), json=input_json)
    assert response.status_code == 200

    db_product = await daos.product.filter_first(id=product.id)

    assert db_product is not None
    assert db_product.volume == input_json["volume"]
    assert db_product.price == input_json["price"]
    assert db_product.title == input_json["title"]
    assert db_product.descrioption == input_json["descrioption"]
    assert db_product.delivery_possible == input_json["delivery_possible"]
    assert db_product.pickup_location == input_json["pickup_location"]
    assert db_product.seller_id == UUID(input_json["seller_id"])
    assert db_product.wood_type_id == UUID(input_json["wood_type_id"])
