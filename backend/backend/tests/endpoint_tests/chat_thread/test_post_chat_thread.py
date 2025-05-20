from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/chat-threads/"


@pytest.mark.anyio
async def test_post_chat_thread(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create ChatThread: 201."""
    buyer = await factories.BuyerFactory.create()
    seller = await factories.SellerFactory.create()

    input_json = {
        "id": str(uuid4()),
        "buyer_id": str(buyer.id),
        "seller_id": str(seller.id),
    }

    response = await client.post(URI, json=input_json)
    assert response.status_code == 201

    response_data = response.json()["data"]
    db_chat_thread = await daos.chat_thread.filter_first(
        id=response_data["id"],
    )

    assert db_chat_thread is not None
    assert db_chat_thread.buyer_id == UUID(input_json["buyer_id"])
    assert db_chat_thread.seller_id == UUID(input_json["seller_id"])
