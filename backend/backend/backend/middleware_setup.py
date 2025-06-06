from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.settings import settings
from backend.middleware.activity_tracking import ActivityTrackingMiddleware

def _add_cors_middleware(app: FastAPI) -> None:
    """Add CORS Middleware."""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors.origins_list,
        allow_credentials=settings.cors.allow_credentials,
        allow_methods=settings.cors.methods_list,
        allow_headers=settings.cors.headers_list,
    )

def _add_activity_tracking_middleware(app: FastAPI) -> None:
    """Add Activity Tracking Middleware."""
    app.add_middleware(ActivityTrackingMiddleware)

def add_middleware(app: FastAPI) -> None:
    """Add all middlewares."""
    _add_cors_middleware(app)
    # Activity tracking middleware enabled with proper error handling
    _add_activity_tracking_middleware(app)
