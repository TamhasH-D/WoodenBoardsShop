from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from loguru import logger

from backend.db import db_lifetime
from backend.middleware import add_middleware
from backend.routes import base_router
from backend.routes.websocket_routes import router as websocket_router
from backend.services.redis import redis_lifetime
from backend.settings import settings


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan."""
    await db_lifetime.setup_db(app)
    await redis_lifetime.setup_redis(app)

    yield

    await db_lifetime.shutdown_db(app)
    await redis_lifetime.shutdown_redis(app)


def get_app() -> FastAPI:
    """Get FastAPI app."""
    if settings.env != "test":
        logger.info(
            settings.model_dump_json(indent=2),
        )

    logger.info("Alembic enabled - see Makefile for migration commands")

    app = FastAPI(lifespan=lifespan)
    add_middleware(app)
    app.include_router(base_router)
    app.include_router(websocket_router)  # WebSocket router на корневом уровне
    return app
