from datetime import UTC, datetime
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base


class WoodTypePrice(Base):
    """WoodTypePrice model."""

    __tablename__ = "wood_type_price"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    price_per_m3: Mapped[float] = mapped_column(sa.Float, index=True)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.now(UTC)
    )
    wood_type_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True),
        sa.ForeignKey("wood_type_price.id", ondelete="CASCADE"),
        index=True,
    )

    wood_type: Mapped["WoodTypePrice"] = relationship(
        foreign_keys=[wood_type_id], back_populates="wood_type_price", uselist=False
    )
