
import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/wood-type-prices/{wood_type_price_id}"


@pytest.mark.anyio
async def test_get_wood_type_price_by_id(
    client: AsyncClient,
) -> None:
    """Test get wood_type_price by id: 200."""
    wood_type_price = await factories.WoodTypePriceFactory.create()

    response = await client.get(URI.format(wood_type_price_id=wood_type_price.id))
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["id"] == str(wood_type_price.id)
    assert response_data["created_at"] == wood_type_price.created_at.isoformat()
    assert response_data["price_per_m3"] == wood_type_price.price_per_m3
    assert response_data["wood_type_id"] == str(wood_type_price.wood_type_id)
