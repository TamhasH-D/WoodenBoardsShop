import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/products/{product_id}"


@pytest.mark.anyio
async def test_get_product_by_id(
    client: AsyncClient,
) -> None:
    """Test get product by id: 200."""
    product = await factories.ProductFactory.create()

    response = await client.get(URI.format(product_id=product.id))
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["id"] == str(product.id)
    assert response_data["volume"] == product.volume
    assert response_data["price"] == product.price
    assert response_data["title"] == product.title
    assert response_data["descrioption"] == product.descrioption
    assert response_data["delivery_possible"] == product.delivery_possible
    assert response_data["pickup_location"] == product.pickup_location
    # Remove Z suffix from response date if present
    created_at = response_data["created_at"].rstrip("Z")
    updated_at = response_data["updated_at"].rstrip("Z")
    assert created_at == product.created_at.isoformat()
    assert updated_at == product.updated_at.isoformat()
    assert response_data["seller_id"] == str(product.seller_id)
    assert response_data["wood_type_id"] == str(product.wood_type_id)
