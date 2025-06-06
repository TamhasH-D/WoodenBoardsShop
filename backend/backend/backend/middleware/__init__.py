"""Middleware package for backend application."""

from .activity_tracking import ActivityTrackingMiddleware

__all__ = ["ActivityTrackingMiddleware"]
