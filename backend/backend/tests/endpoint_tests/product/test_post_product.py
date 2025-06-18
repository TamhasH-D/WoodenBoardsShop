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


@pytest.mark.anyio
async def test_create_product_duplicate_title_for_seller(
    client: AsyncClient,
    daos: AllDAOs, # Provides db_session implicitly for factories
    # auth_headers_seller: dict[str, str], # Assuming this is available if endpoint is protected
) -> None:
    """Test creating a product with a duplicate title for the same seller returns 409."""
    # Factories use the db_session provided by the 'daos' fixture via 'inject_session'
    seller = await factories.SellerFactory.create()
    wood_type = await factories.WoodTypeFactory.create(neme="Test Wood for Product Dupe Test") # Use 'neme' for WoodType factory

    product_title = "Duplicate Product Test Title"

    payload1 = {
        "title": product_title,
        "descrioption": "First product instance",
        "price": 100.0,
        "volume": 10.0,
        "seller_id": str(seller.id),
        "wood_type_id": str(wood_type.id),
        "delivery_possible": True,
        "pickup_location": "Location A",
    }
    # If auth is needed: headers=auth_headers_seller
    response1 = await client.post(URI, json=payload1)
    assert response1.status_code == 201

    # Second POST request: Attempt to create another product with the same title and seller_id.
    payload2 = {
        "title": product_title, # Same title
        "descrioption": "Second product instance",
        "price": 150.0,
        "volume": 5.0,
        "seller_id": str(seller.id), # Same seller
        "wood_type_id": str(wood_type.id),
        "delivery_possible": False,
        "pickup_location": "Location B",
    }
    response2 = await client.post(URI, json=payload2)
    assert response2.status_code == 409
    data2 = response2.json()
    assert data2["detail"] == "A product with this title already exists for this seller."

    # Third POST request: Attempt with different case for title.
    payload3 = {
        "title": product_title.lower(), # Different case
        "descrioption": "Third product instance, different case title",
        "price": 200.0,
        "volume": 12.0,
        "seller_id": str(seller.id), # Same seller
        "wood_type_id": str(wood_type.id),
        "delivery_possible": True,
        "pickup_location": "Location C",
    }
    response3 = await client.post(URI, json=payload3)
    assert response3.status_code == 409
    data3 = response3.json()
    assert data3["detail"] == "A product with this title already exists for this seller."
