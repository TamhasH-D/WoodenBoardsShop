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
        if self._redis is None or not self._redis.ping():
            self._redis = redis.from_url(self.redis_url)
        return self._redis

    async def get(self, key: str, model: Type[T]) -> Optional[T]:
        client = await self._get_redis_client()
        cached_data = await client.get(key)
        if cached_data:
            return model.model_validate(json.loads(cached_data))
        return None

    async def set(self, key: str, value: BaseModel, ttl: Optional[int] = None):
        client = await self._get_redis_client()
        await client.set(
            key, value.model_dump_json(), ex=ttl if ttl is not None else self.default_ttl
        )

    async def delete(self, key: str):
        client = await self._get_redis_client()
        await client.delete(key)

    async def close(self):
        if self._redis:
            await self._redis.close()


# Initialize a global CacheManager instance
cache_manager = CacheManager(settings.redis.url)
