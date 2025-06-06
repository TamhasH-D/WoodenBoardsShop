import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/sellers/{seller_id}"


@pytest.mark.anyio
async def test_delete_seller(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete Seller: 204."""
    seller = await factories.SellerFactory.create()

    response = await client.delete(URI.format(seller_id=seller.id))
    assert response.status_code == 204

    db_seller = await daos.seller.filter_first(id=seller.id)
    assert db_seller is None
