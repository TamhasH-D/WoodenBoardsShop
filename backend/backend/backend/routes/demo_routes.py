from typing import Any

from fastapi import APIRouter

from backend import exceptions
from backend.services.redis import GetRedis

router = APIRouter(prefix="/demo")


@router.post("/set-redis")
async def set_redis_value(
    key: str,
    value: str,
    redis: GetRedis,
) -> None:
    await redis.set(key, value)


@router.get("/get-redis")
async def get_redis_value(
    key: str,
    redis: GetRedis,
) -> dict[str, Any]:
    value = await redis.get(key)
    if value is None:
        raise exceptions.Http404(detail="Key not found in Redis")
    return {"key": key, "value": value}
