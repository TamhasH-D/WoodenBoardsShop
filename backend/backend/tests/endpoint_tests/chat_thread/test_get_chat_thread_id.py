import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/chat-threads/{chat_thread_id}"


@pytest.mark.anyio
async def test_get_chat_thread_by_id(
    client: AsyncClient,
) -> None:
    """Test get chat_thread by id: 200."""
    chat_thread = await factories.ChatThreadFactory.create()

    response = await client.get(URI.format(chat_thread_id=chat_thread.id))
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["id"] == str(chat_thread.id)
    # Remove Z suffix from response date if present
    created_at = response_data["created_at"].rstrip("Z")
    assert created_at == chat_thread.created_at.isoformat()
    assert response_data["buyer_id"] == str(chat_thread.buyer_id)
    assert response_data["seller_id"] == str(chat_thread.seller_id)
