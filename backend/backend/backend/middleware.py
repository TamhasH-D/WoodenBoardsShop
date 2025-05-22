from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def _add_cors_middleware(app: FastAPI) -> None:
    """Add CORS Middleware."""
    # Allow specific frontend origins
    allowed_origins = [
        "http://localhost:3000",  # Admin frontend
        "http://localhost:3001",  # Buyer frontend
        "http://localhost:3002",  # Seller frontend
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def add_middleware(app: FastAPI) -> None:
    """Add all middlewares."""
    _add_cors_middleware(app)
