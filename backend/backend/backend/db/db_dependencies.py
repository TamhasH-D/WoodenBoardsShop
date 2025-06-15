from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends, WebSocket
from sqlalchemy import exc as sa_exc
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request


async def get_db_session(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    session: AsyncSession = request.app.state.db_session_factory()

    try:
        yield session
    except sa_exc.DBAPIError:
        await session.rollback()
        raise
    finally:
        await session.commit()
        await session.close()


async def get_db_session_websocket(websocket: WebSocket) -> AsyncGenerator[AsyncSession, None]:
    """Get database session for WebSocket connections."""
    session: AsyncSession = websocket.app.state.db_session_factory()

    try:
        yield session
    except sa_exc.DBAPIError:
        await session.rollback()
        raise
    finally:
        await session.commit()
        await session.close()


GetDBSession = Annotated[AsyncSession, Depends(get_db_session)]
GetDBSessionWebSocket = Annotated[AsyncSession, Depends(get_db_session_websocket)]
