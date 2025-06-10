import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/buyers/{buyer_id}"


@pytest.mark.anyio
async def test_delete_buyer(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete Buyer: 200."""
    buyer = await factories.BuyerFactory.create()

    response = await client.delete(URI.format(buyer_id=buyer.id))
    assert response.status_code == 200

    db_buyer = await daos.buyer.filter_first(id=buyer.id)
    assert db_buyer is None
