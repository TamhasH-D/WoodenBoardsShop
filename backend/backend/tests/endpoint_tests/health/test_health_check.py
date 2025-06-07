import pytest
from httpx import AsyncClient

URI = "/api/v1/health"


@pytest.mark.anyio
async def test_health_check(
    client: AsyncClient,
) -> None:
    """Test health check endpoint: 200."""
    response = await client.get(URI)
    
    assert response.status_code == 200
    response_data = response.json()
    
    # Health check should return True
    assert response_data is True


@pytest.mark.anyio
async def test_health_check_method_not_allowed(
    client: AsyncClient,
) -> None:
    """Test health check with wrong method: 405."""
    response = await client.post(URI)
    
    assert response.status_code == 405  # Method Not Allowed


@pytest.mark.anyio
async def test_health_check_multiple_calls(
    client: AsyncClient,
) -> None:
    """Test health check endpoint multiple times: 200."""
    # Health check should be idempotent and always return the same result
    for _ in range(3):
        response = await client.get(URI)
        assert response.status_code == 200
        assert response.json() is True
