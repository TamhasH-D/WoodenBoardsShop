import pytest
from httpx import AsyncClient

from backend.daos import AllDAOs
from tests import factories

URI = "/api/v1/chat-threads/{chat_thread_id}"


@pytest.mark.anyio
async def test_delete_chat_thread(
    client: AsyncClient,
    daos: AllDAOs,
) -> None:
    """Test delete ChatThread: 200."""
    chat_thread = await factories.ChatThreadFactory.create()

    response = await client.delete(URI.format(chat_thread_id=chat_thread.id))
    assert response.status_code == 200

    db_chat_thread = await daos.chat_thread.filter_first(id=chat_thread.id)
    assert db_chat_thread is None
