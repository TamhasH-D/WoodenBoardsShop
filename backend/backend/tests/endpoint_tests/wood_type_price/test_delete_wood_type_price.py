import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/wood-type-prices/{wood_type_price_id}"


@pytest.mark.anyio
async def test_delete_wood_type_price(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete WoodTypePrice: 200."""
    wood_type_price = await factories.WoodTypePriceFactory.create()

    response = await client.delete(URI.format(wood_type_price_id=wood_type_price.id))
    assert response.status_code == 200

    db_wood_type_price = await daos.wood_type_price.filter_first(id=wood_type_price.id)
    assert db_wood_type_price is None
