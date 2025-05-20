from uuid import UUID

import pytest
from httpx import AsyncClient

from tests import factories

URI = "/api/v1/chat-threads/"


@pytest.mark.anyio
async def test_get_chat_threads(
    client: AsyncClient,
) -> None:
    """Test get ChatThread: 200."""
    chat_threads = await factories.ChatThreadFactory.create_batch(3)

    response = await client.get(URI)
    assert response.status_code == 200

    response_data = response.json()["data"]
    assert len(response_data) == 3

    for chat_thread, data in zip(chat_threads, response_data, strict=True):
        assert str(chat_thread.id) == data["id"]
