from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.settings import settings

def _add_cors_middleware(app: FastAPI) -> None:
    """Add CORS Middleware."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors.allow_origins,
        allow_credentials=settings.cors.allow_credentials,
        allow_methods=settings.cors.allow_methods,
        allow_headers=settings.cors.allow_headers,
    )

def add_middleware(app: FastAPI) -> None:
    """Add all middlewares."""
    _add_cors_middleware(app)
