from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base
from backend.models.seller_models import Seller
from backend.models.wood_type_models import WoodType

if TYPE_CHECKING:
    from backend.models.image_models import Image


class Product(Base):
    """Product model."""

    __tablename__ = "product"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    volume: Mapped[float] = mapped_column(sa.Float, index=True)
    price: Mapped[float] = mapped_column(sa.Float, index=True)
    title: Mapped[str] = mapped_column(sa.String, index=True)
    descrioption: Mapped[str | None] = mapped_column(sa.String)
    delivery_possible: Mapped[bool] = mapped_column(
        sa.Boolean, index=True, default=False
    )
    pickup_location: Mapped[str | None] = mapped_column(sa.String, index=True)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.now(UTC)
    )
    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        default=datetime.now(UTC),
        onupdate=datetime.now(UTC),
    )
    seller_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True),
        sa.ForeignKey("seller.id", ondelete="CASCADE"),
        index=True,
    )
    wood_type_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True),
        sa.ForeignKey("wood_type.id", ondelete="CASCADE"),
        index=True,
    )

    seller: Mapped[Seller] = relationship(
        foreign_keys=[seller_id], back_populates="product", uselist=False
    )
    wood_type: Mapped[WoodType] = relationship(
        foreign_keys=[wood_type_id], back_populates="product", uselist=False
    )
    image: Mapped[list["Image"]] = relationship(back_populates="product")
