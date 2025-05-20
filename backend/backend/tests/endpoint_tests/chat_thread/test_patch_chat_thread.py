from uuid import UUID

import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/chat-threads/{chat_thread_id}"


@pytest.mark.anyio
async def test_patch_chat_thread(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test patch ChatThread: 200."""
    buyer = await factories.BuyerFactory.create()
    seller = await factories.SellerFactory.create()
    chat_thread = await factories.ChatThreadFactory.create()

    input_json = {
        "buyer_id": str(buyer.id),
        "seller_id": str(seller.id),
    }

    response = await client.patch(
        URI.format(chat_thread_id=chat_thread.id), json=input_json
    )
    assert response.status_code == 200

    db_chat_thread = await daos.chat_thread.filter_first(id=chat_thread.id)

    assert db_chat_thread is not None
    assert db_chat_thread.buyer_id == UUID(input_json["buyer_id"])
    assert db_chat_thread.seller_id == UUID(input_json["seller_id"])
