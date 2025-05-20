from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base

if TYPE_CHECKING:
    from backend.models.chat_message_models import ChatMessage
    from backend.models.chat_thread_models import ChatThread
    from backend.models.product_models import Product


class Seller(Base):
    """Seller model."""

    __tablename__ = "seller"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    keycloak_uuid: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), unique=True, index=True
    )
    is_online: Mapped[bool] = mapped_column(sa.Boolean, index=True, default=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        default=datetime.now(UTC),
        onupdate=datetime.now(UTC),
    )

    # Relationships
    chat_message: Mapped[list["ChatMessage"]] = relationship(back_populates="seller")
    chat_thread: Mapped[list["ChatThread"]] = relationship(back_populates="seller")
    product: Mapped[list["Product"]] = relationship(back_populates="seller")
