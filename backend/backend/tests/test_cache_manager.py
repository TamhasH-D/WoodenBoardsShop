import pytest
from unittest.mock import AsyncMock, MagicMock, call # import call

from backend.cache_manager import CacheManager
# Assuming settings.redis.url can be accessed or mocked if CacheManager instantiation is complex.
# For simplicity, we might instantiate CacheManager directly if its __init__ is simple,
# or use a fixture if specific configuration (like a mock redis_url) is needed.

@pytest.fixture
def mock_redis_client():
    """Fixture to mock the Redis client instance returned by _get_redis_client."""
    client = AsyncMock()
    # Configure common methods like get, set, delete, scan_iter if needed by default
    client.get = AsyncMock()
    client.set = AsyncMock()
    client.delete = AsyncMock()

    # For scan_iter, it needs to be an async generator
    async def async_gen_scan_iter(*args, **kwargs):
        for item in kwargs.get('mock_keys_return', []): # Allow specifying mock keys
            yield item

    client.scan_iter = MagicMock(side_effect=lambda match=None: async_gen_scan_iter(mock_keys_return=kwargs.get('mock_scan_iter_keys', [])))
    return client

@pytest.fixture
def cache_manager_instance(mocker, mock_redis_client: AsyncMock):
    """Fixture for CacheManager instance with a mocked _get_redis_client."""
    # Patch _get_redis_client to return our mock_redis_client
    mocker.patch.object(CacheManager, '_get_redis_client', return_value=mock_redis_client)
    # Instantiate CacheManager - assuming direct instantiation is okay for tests
    # If settings.redis.url is complex, this might need adjustment or a mock URL.
    manager = CacheManager(redis_url="redis://mock-redis:6379")
    return manager

# Tests for CacheManager

@pytest.mark.asyncio
async def test_get_raw_existing_key(cache_manager_instance: CacheManager, mock_redis_client: AsyncMock):
    # Arrange
    key = "test_key_raw"
    expected_value = "test_value"
    mock_redis_client.get.return_value = expected_value.encode('utf-8') # Redis client returns bytes

    # Act
    result = await cache_manager_instance.get_raw(key)

    # Assert
    mock_redis_client.get.assert_called_once_with(key)
    assert result == expected_value

@pytest.mark.asyncio
async def test_get_raw_non_existent_key(cache_manager_instance: CacheManager, mock_redis_client: AsyncMock):
    # Arrange
    key = "non_existent_key_raw"
    mock_redis_client.get.return_value = None

    # Act
    result = await cache_manager_instance.get_raw(key)

    # Assert
    mock_redis_client.get.assert_called_once_with(key)
    assert result is None

@pytest.mark.asyncio
async def test_set_raw(cache_manager_instance: CacheManager, mock_redis_client: AsyncMock):
    # Arrange
    key = "test_key_set_raw"
    value = "test_value_set"
    ttl = 300

    # Act
    await cache_manager_instance.set_raw(key, value, ttl=ttl)

    # Assert
    mock_redis_client.set.assert_called_once_with(key, value, ex=ttl)

@pytest.mark.asyncio
async def test_set_raw_default_ttl(cache_manager_instance: CacheManager, mock_redis_client: AsyncMock):
    # Arrange
    key = "test_key_set_raw_default_ttl"
    value = "test_value_set_default"

    # Act
    await cache_manager_instance.set_raw(key, value) # No ttl specified

    # Assert
    # The default_ttl is part of the CacheManager instance, check it was used.
    mock_redis_client.set.assert_called_once_with(key, value, ex=cache_manager_instance.default_ttl)


@pytest.mark.asyncio
async def test_delete_by_pattern(cache_manager_instance: CacheManager, mock_redis_client: AsyncMock):
    # Arrange
    pattern = "some_pattern:*"
    dummy_keys = [b"some_pattern:key1", b"some_pattern:key2"] # Redis scan_iter yields bytes

    # Configure scan_iter mock on the client directly
    # Need to make scan_iter an async generator mock
    async def mock_scan_iter_gen(*args, **kwargs):
        for k in dummy_keys:
            yield k

    mock_redis_client.scan_iter = MagicMock(return_value=mock_scan_iter_gen())


    # Act
    await cache_manager_instance.delete_by_pattern(pattern)

    # Assert
    mock_redis_client.scan_iter.assert_called_once_with(match=pattern)
    # client.delete should be called with unpacked keys.
    # The keys from scan_iter are bytes, client.delete expects strings or bytes depending on client version.
    # Assuming client.delete can handle bytes here as redis-py client methods often do.
    mock_redis_client.delete.assert_called_once_with(*dummy_keys)

@pytest.mark.asyncio
async def test_delete_by_pattern_no_keys_found(cache_manager_instance: CacheManager, mock_redis_client: AsyncMock):
    # Arrange
    pattern = "empty_pattern:*"

    async def mock_scan_iter_empty_gen(*args, **kwargs):
        if False: # Ensure it's a generator
            yield

    mock_redis_client.scan_iter = MagicMock(return_value=mock_scan_iter_empty_gen())

    # Act
    await cache_manager_instance.delete_by_pattern(pattern)

    # Assert
    mock_redis_client.scan_iter.assert_called_once_with(match=pattern)
    mock_redis_client.delete.assert_not_called() # client.delete should not be called if no keys
