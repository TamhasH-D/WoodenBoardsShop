import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/chat-messages/{chat_message_id}"


@pytest.mark.anyio
async def test_get_chat_message_by_id(
    client: AsyncClient,
) -> None:
    """Test get chat_message by id: 200."""
    chat_message = await factories.ChatMessageFactory.create()

    response = await client.get(URI.format(chat_message_id=chat_message.id))
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert response_data["id"] == str(chat_message.id)
    assert response_data["message"] == chat_message.message
    assert response_data["is_read_by_buyer"] == chat_message.is_read_by_buyer
    assert response_data["is_read_by_seller"] == chat_message.is_read_by_seller
    # Remove Z suffix from response date if present
    created_at = response_data["created_at"].rstrip("Z")
    assert created_at == chat_message.created_at.isoformat()
    assert response_data["thread_id"] == str(chat_message.thread_id)
    assert response_data["buyer_id"] == str(chat_message.buyer_id)
    assert response_data["seller_id"] == str(chat_message.seller_id)
