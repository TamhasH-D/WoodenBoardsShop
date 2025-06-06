import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/chat-messages/{chat_message_id}"


@pytest.mark.anyio
async def test_delete_chat_message(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete ChatMessage: 204."""
    chat_message = await factories.ChatMessageFactory.create()

    response = await client.delete(URI.format(chat_message_id=chat_message.id))
    assert response.status_code == 204

    db_chat_message = await daos.chat_message.filter_first(id=chat_message.id)
    assert db_chat_message is None
