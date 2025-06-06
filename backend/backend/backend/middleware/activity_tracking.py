"""Activity tracking middleware for automatic online/offline status management."""

import asyncio
from datetime import datetime, timedelta, UTC
from typing import Callable
import logging

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from backend.models.seller_models import Seller
from backend.models.buyer_models import Buyer

logger = logging.getLogger(__name__)

# Configuration
OFFLINE_THRESHOLD_MINUTES = 5
ACTIVITY_UPDATE_PATHS = [
    "/api/v1/sellers",
    "/api/v1/buyers", 
    "/api/v1/products",
    "/api/v1/wood-types",
    "/api/v1/wood-type-prices",
    "/api/v1/chat-threads",
    "/api/v1/chat-messages",
    "/api/v1/keep-alive"
]

# Paths that should not trigger activity updates (to avoid infinite loops)
EXCLUDED_PATHS = [
    "/api/v1/health",
    "/docs",
    "/openapi.json",
    "/favicon.ico"
]


class ActivityTrackingMiddleware(BaseHTTPMiddleware):
    """Middleware to track user activity and update online status."""

    def __init__(self, app, offline_threshold_minutes: int = OFFLINE_THRESHOLD_MINUTES):
        super().__init__(app)
        self.offline_threshold_minutes = offline_threshold_minutes
        self.background_task_running = False
        self.background_task = None

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request and update user activity if applicable."""

        # Process the request first
        response = await call_next(request)

        # Skip activity tracking for excluded paths
        if any(request.url.path.startswith(path) for path in EXCLUDED_PATHS):
            return response

        # Skip if not a relevant API path
        if not any(request.url.path.startswith(path) for path in ACTIVITY_UPDATE_PATHS):
            return response

        # Start background task if not running and DB is available
        if not self.background_task_running and hasattr(self.app.state, 'db_session_factory'):
            self.start_background_task()

        # Extract user information from request
        user_info = await self.extract_user_info(request)

        if user_info:
            # Update user activity in background to avoid blocking response
            asyncio.create_task(self.update_user_activity(user_info))

        return response

    async def extract_user_info(self, request: Request) -> dict | None:
        """Extract user information from request path and body."""
        try:
            path = request.url.path
            
            # Extract seller ID from seller-related endpoints
            if "/sellers/" in path:
                parts = path.split("/sellers/")
                if len(parts) > 1 and parts[1]:
                    seller_id = parts[1].split("/")[0]
                    return {"type": "seller", "id": seller_id}
            
            # Extract buyer ID from buyer-related endpoints  
            if "/buyers/" in path:
                parts = path.split("/buyers/")
                if len(parts) > 1 and parts[1]:
                    buyer_id = parts[1].split("/")[0]
                    return {"type": "buyer", "id": buyer_id}
                    
            # For other endpoints, try to extract from request body or query params
            if request.method in ["POST", "PATCH", "PUT"]:
                # This is a simplified approach - in a real app you'd extract from JWT tokens
                # For now, we'll rely on the frontend sending user info in headers or body
                seller_id = request.headers.get("X-Seller-ID")
                buyer_id = request.headers.get("X-Buyer-ID")
                
                if seller_id:
                    return {"type": "seller", "id": seller_id}
                elif buyer_id:
                    return {"type": "buyer", "id": buyer_id}
                    
        except Exception as e:
            logger.warning(f"Failed to extract user info from request: {e}")
            
        return None

    async def update_user_activity(self, user_info: dict):
        """Update user's last activity and online status."""
        try:
            # Check if session factory is available
            if not hasattr(self.app.state, 'db_session_factory'):
                logger.warning("Database session factory not available, skipping activity update")
                return

            session_factory = self.app.state.db_session_factory
            async with session_factory() as session:
                now = datetime.now(UTC)

                if user_info["type"] == "seller":
                    await session.execute(
                        update(Seller)
                        .where(Seller.id == user_info["id"])
                        .values(
                            last_activity=now,
                            is_online=True,
                            updated_at=now
                        )
                    )
                elif user_info["type"] == "buyer":
                    await session.execute(
                        update(Buyer)
                        .where(Buyer.id == user_info["id"])
                        .values(
                            last_activity=now,
                            is_online=True,
                            updated_at=now
                        )
                    )

                await session.commit()
                logger.debug(f"Updated activity for {user_info['type']} {user_info['id']}")

        except Exception as e:
            logger.error(f"Failed to update user activity: {e}")

    def start_background_task(self):
        """Start the background task to mark inactive users as offline."""
        if not self.background_task_running and hasattr(self.app.state, 'db_session_factory'):
            self.background_task_running = True
            self.background_task = asyncio.create_task(self.offline_checker_task())

    async def offline_checker_task(self):
        """Background task to periodically mark inactive users as offline."""
        while self.background_task_running:
            try:
                await self.mark_inactive_users_offline()
                # Run every minute to check for offline users
                await asyncio.sleep(60)
            except Exception as e:
                logger.error(f"Error in offline checker task: {e}")
                await asyncio.sleep(60)

    async def mark_inactive_users_offline(self):
        """Mark users as offline if they haven't been active for the threshold period."""
        try:
            # Check if session factory is available
            if not hasattr(self.app.state, 'db_session_factory'):
                logger.warning("Database session factory not available, skipping offline check")
                return

            session_factory = self.app.state.db_session_factory
            async with session_factory() as session:
                cutoff_time = datetime.now(UTC) - timedelta(minutes=self.offline_threshold_minutes)
                now = datetime.now(UTC)

                # Mark inactive sellers as offline
                seller_result = await session.execute(
                    update(Seller)
                    .where(
                        Seller.last_activity < cutoff_time,
                        Seller.is_online == True
                    )
                    .values(
                        is_online=False,
                        updated_at=now
                    )
                )

                # Mark inactive buyers as offline
                buyer_result = await session.execute(
                    update(Buyer)
                    .where(
                        Buyer.last_activity < cutoff_time,
                        Buyer.is_online == True
                    )
                    .values(
                        is_online=False,
                        updated_at=now
                    )
                )

                await session.commit()

                sellers_updated = seller_result.rowcount
                buyers_updated = buyer_result.rowcount

                if sellers_updated > 0 or buyers_updated > 0:
                    logger.info(f"Marked {sellers_updated} sellers and {buyers_updated} buyers as offline")

        except Exception as e:
            logger.error(f"Failed to mark inactive users offline: {e}")

    async def shutdown(self):
        """Shutdown the background task."""
        self.background_task_running = False
        if self.background_task and not self.background_task.done():
            self.background_task.cancel()
            try:
                await self.background_task
            except asyncio.CancelledError:
                pass
