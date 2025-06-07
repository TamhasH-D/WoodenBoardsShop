import pytest
from httpx import AsyncClient

SET_URI = "/api/v1/demo/set-redis"
GET_URI = "/api/v1/demo/get-redis"


@pytest.mark.anyio
async def test_set_redis_value(
    client: AsyncClient,
) -> None:
    """Test set Redis value: 200."""
    test_data = {
        "key": "test_key",
        "value": "test_value"
    }
    
    response = await client.post(SET_URI, params=test_data)
    
    assert response.status_code == 200


@pytest.mark.anyio
async def test_get_redis_value_existing_key(
    client: AsyncClient,
) -> None:
    """Test get Redis value for existing key: 200."""
    # First set a value
    test_key = "test_key_get"
    test_value = "test_value_get"
    
    set_data = {
        "key": test_key,
        "value": test_value
    }
    
    await client.post(SET_URI, params=set_data)
    
    # Then get the value
    get_params = {"key": test_key}
    response = await client.get(GET_URI, params=get_params)
    
    assert response.status_code == 200
    response_data = response.json()
    
    assert response_data["key"] == test_key
    assert response_data["value"] == test_value


@pytest.mark.anyio
async def test_get_redis_value_nonexistent_key(
    client: AsyncClient,
) -> None:
    """Test get Redis value for nonexistent key: 404."""
    get_params = {"key": "nonexistent_key_12345"}
    response = await client.get(GET_URI, params=get_params)
    
    assert response.status_code == 404
    response_data = response.json()
    
    assert "detail" in response_data
    assert "Key not found in Redis" in response_data["detail"]


@pytest.mark.anyio
async def test_set_redis_missing_parameters(
    client: AsyncClient,
) -> None:
    """Test set Redis value with missing parameters: 422."""
    # Missing value parameter
    test_data = {
        "key": "test_key_only"
    }
    
    response = await client.post(SET_URI, params=test_data)
    
    assert response.status_code == 422  # Unprocessable Entity


@pytest.mark.anyio
async def test_get_redis_missing_parameters(
    client: AsyncClient,
) -> None:
    """Test get Redis value with missing parameters: 422."""
    response = await client.get(GET_URI)
    
    assert response.status_code == 422  # Unprocessable Entity


@pytest.mark.anyio
async def test_redis_operations_workflow(
    client: AsyncClient,
) -> None:
    """Test complete Redis workflow: set, get, overwrite, get: 200."""
    test_key = "workflow_test_key"
    initial_value = "initial_value"
    updated_value = "updated_value"
    
    # Step 1: Set initial value
    set_data = {
        "key": test_key,
        "value": initial_value
    }
    response = await client.post(SET_URI, params=set_data)
    assert response.status_code == 200
    
    # Step 2: Get initial value
    get_params = {"key": test_key}
    response = await client.get(GET_URI, params=get_params)
    assert response.status_code == 200
    assert response.json()["value"] == initial_value
    
    # Step 3: Overwrite with new value
    set_data["value"] = updated_value
    response = await client.post(SET_URI, params=set_data)
    assert response.status_code == 200
    
    # Step 4: Get updated value
    response = await client.get(GET_URI, params=get_params)
    assert response.status_code == 200
    assert response.json()["value"] == updated_value


@pytest.mark.anyio
async def test_redis_special_characters(
    client: AsyncClient,
) -> None:
    """Test Redis operations with special characters: 200."""
    test_key = "special_chars_key"
    test_value = "Special chars: !@#$%^&*()_+-={}[]|\\:;\"'<>?,./"
    
    # Set value with special characters
    set_data = {
        "key": test_key,
        "value": test_value
    }
    response = await client.post(SET_URI, params=set_data)
    assert response.status_code == 200
    
    # Get value with special characters
    get_params = {"key": test_key}
    response = await client.get(GET_URI, params=get_params)
    assert response.status_code == 200
    assert response.json()["value"] == test_value
