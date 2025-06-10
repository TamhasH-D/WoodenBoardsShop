import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/wood-type-prices/"


@pytest.mark.anyio
async def test_get_wood_type_prices(
    client: AsyncClient,
) -> None:
    """Test get WoodTypePrice: 200."""
    wood_type_prices = await factories.WoodTypePriceFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for wood_type_price, data in zip(wood_type_prices, response_data, strict=True):
        assert str(wood_type_price.id) == data["id"]
