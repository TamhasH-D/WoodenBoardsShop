import json
from typing import Any, Optional, Type, TypeVar

import redis.asyncio as redis
from pydantic import BaseModel

from backend.settings import settings

T = TypeVar("T", bound=BaseModel)


class CacheManager:
    def __init__(self, redis_url: str, default_ttl: int = 3600):
        self.redis_url = redis_url
        self.default_ttl = default_ttl
        self._redis: Optional[redis.Redis] = None

    async def _get_redis_client(self) -> redis.Redis:
        # Simple ping check; consider more robust health checks for production
        # For example, try/except around the ping or connection establishment.
        if self._redis is None:
            self._redis = redis.from_url(self.redis_url)

        try:
            await self._redis.ping()
        except (redis.exceptions.ConnectionError, redis.exceptions.TimeoutError):
            # Attempt to reconnect
            if self._redis:
                try:
                    await self._redis.close() # Ensure old connection is closed
                except redis.exceptions.RedisError: # Ignore errors on close if connection already broken
                    pass
            self._redis = redis.from_url(self.redis_url)
            # Optionally, re-ping or raise if still failing after reconnect attempt

        return self._redis

    async def get(self, key: str, model: Type[T]) -> Optional[T]:
        client = await self._get_redis_client()
        cached_data = await client.get(key)
        if cached_data:
            try:
                return model.model_validate(json.loads(cached_data))
            except json.JSONDecodeError:
                # Optionally log this error
                return None # Treat as cache miss if data is corrupted
        return None

    async def set(self, key: str, value: BaseModel, ttl: Optional[int] = None):
        client = await self._get_redis_client()
        await client.set(
            key, value.model_dump_json(), ex=ttl if ttl is not None else self.default_ttl
        )

    async def get_raw(self, key: str) -> Optional[str]:
        client = await self._get_redis_client()
        cached_data_bytes = await client.get(key) # Redis client returns bytes
        if cached_data_bytes:
            return cached_data_bytes.decode('utf-8') # Decode bytes to string
        return None

    async def set_raw(self, key: str, value: str, ttl: Optional[int] = None):
        client = await self._get_redis_client()
        await client.set(
            key, value, ex=ttl if ttl is not None else self.default_ttl # Store string value directly
        )

    async def delete(self, key: str):
        client = await self._get_redis_client()
        await client.delete(key)

    async def delete_by_pattern(self, pattern: str):
        client = await self._get_redis_client()
        keys_to_delete = []
        # Ensure cursor-based iteration for large datasets, scan_iter handles this.
        async for key in client.scan_iter(match=pattern):
            keys_to_delete.append(key)

        if keys_to_delete:
            await client.delete(*keys_to_delete) # Unpack list of keys

    async def close(self):
        if self._redis:
            try:
                await self._redis.close()
            except redis.exceptions.RedisError:
                 pass # Ignore errors if connection already problematic
            self._redis = None # Ensure it's reset for next _get_redis_client call


# Initialize a global CacheManager instance
cache_manager = CacheManager(settings.redis.url)
