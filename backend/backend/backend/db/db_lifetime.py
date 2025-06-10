from fastapi import FastAPI
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from backend.settings import settings


async def setup_db(app: FastAPI) -> None:
    """Setup database."""

    engine = create_async_engine(
        str(settings.db.url),
        echo=settings.db.echo,
    )
    session_factory = async_sessionmaker(
        engine,
        expire_on_commit=False,
    )

    app.state.db_engine = engine
    app.state.db_session_factory = session_factory


async def shutdown_db(app: FastAPI) -> None:
    """Shutdown database."""
    await app.state.db_engine.dispose()
