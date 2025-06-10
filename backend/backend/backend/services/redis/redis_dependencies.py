from collections.abc import AsyncGenerator
from typing import Annotated

import redis.asyncio as redis
from fastapi import Depends, Request


async def get_redis(request: Request) -> AsyncGenerator[redis.Redis, None]:
    """Get Redis."""
    redis_client: redis.Redis = request.app.state.redis
    try:
        yield redis_client
    finally:
        await redis_client.aclose()


GetRedis = Annotated[redis.Redis, Depends(get_redis)]
