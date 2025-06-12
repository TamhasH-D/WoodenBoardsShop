from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base

if TYPE_CHECKING:
    from backend.models.chat_message_models import ChatMessage
    from backend.models.chat_thread_models import ChatThread


class Buyer(Base):
    """Buyer model."""

    __tablename__ = "buyer"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    keycloak_uuid: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), unique=True, index=True
    )
    is_online: Mapped[bool] = mapped_column(sa.Boolean, index=True, default=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # Relationships
    chat_message: Mapped[list["ChatMessage"]] = relationship(back_populates="buyer")
    chat_thread: Mapped[list["ChatThread"]] = relationship(back_populates="buyer")
