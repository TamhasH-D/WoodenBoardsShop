from uuid import UUID

import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/chat-messages/"


@pytest.mark.anyio
async def test_get_chat_messages(
    client: AsyncClient,
) -> None:
    """Test get ChatMessage: 200."""
    chat_messages = await factories.ChatMessageFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for chat_message, data in zip(chat_messages, response_data, strict=True):
        assert str(chat_message.id) == data["id"]
