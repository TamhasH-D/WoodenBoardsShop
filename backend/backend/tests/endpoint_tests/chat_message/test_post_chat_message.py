from uuid import UUID, uuid4

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/chat-messages/"


@pytest.mark.anyio
async def test_post_chat_message(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test create ChatMessage: 201."""
    thread = await factories.ChatThreadFactory.create()
    buyer = await factories.BuyerFactory.create()
    seller = await factories.SellerFactory.create()

    input_json = {
        "id": str(uuid4()),
        "message": "world",
        "is_read_by_buyer": False,
        "is_read_by_seller": False,
        "thread_id": str(thread.id),
        "buyer_id": str(buyer.id),
        "seller_id": str(seller.id),
    }

    response = await client.post(URI, json=input_json)
    assert response.status_code == 201

    response_data = response.json()["data"]
    db_chat_message = await daos.chat_message.filter_first(
        id=response_data["id"],
    )

    assert db_chat_message is not None
    assert db_chat_message.message == input_json["message"]
    assert db_chat_message.is_read_by_buyer == input_json["is_read_by_buyer"]
    assert db_chat_message.is_read_by_seller == input_json["is_read_by_seller"]
    assert db_chat_message.thread_id == UUID(input_json["thread_id"])
    assert db_chat_message.buyer_id == UUID(input_json["buyer_id"])
    assert db_chat_message.seller_id == UUID(input_json["seller_id"])
