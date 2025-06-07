from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base
from backend.models.image_models import Image

if TYPE_CHECKING:
    from backend.models.product_models import Product


class WoodenBoard(Base):
    """WoodenBoard model."""

    __tablename__ = "wooden_board"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True, default=uuid4
    )
    height: Mapped[float] = mapped_column(sa.Float, comment="Height in meters")
    width: Mapped[float] = mapped_column(sa.Float, comment="Width in meters")
    lenght: Mapped[float] = mapped_column(sa.Float, comment="Length in meters")  # Keep typo for backward compatibility
    volume: Mapped[float] = mapped_column(sa.Float, comment="Calculated volume in cubic meters")
    confidence: Mapped[float] = mapped_column(sa.Float, comment="AI detection confidence (0-1)")
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        default=datetime.now(UTC),
        onupdate=datetime.now(UTC),
    )

    # Foreign keys
    image_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), sa.ForeignKey("image.id", ondelete="CASCADE"), index=True
    )
    product_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), sa.ForeignKey("product.id", ondelete="CASCADE"), index=True
    )

    # Relationships
    image: Mapped[Image] = relationship(
        foreign_keys=[image_id], back_populates="wooden_board", uselist=False
    )
    product: Mapped["Product"] = relationship(
        foreign_keys=[product_id], back_populates="wooden_boards", uselist=False
    )
