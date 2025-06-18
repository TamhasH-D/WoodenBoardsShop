from typing import TYPE_CHECKING
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base
from backend.models.product_models import Product

if TYPE_CHECKING:
    from backend.models.wooden_board_models import WoodenBoard


class Image(Base):
    """Image model."""

    __tablename__ = "image"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    image_path: Mapped[str] = mapped_column(sa.String, unique=True, index=True)
    product_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True),
        sa.ForeignKey("product.id", ondelete="CASCADE"),
        index=True,
    )

    product: Mapped[Product] = relationship(
        foreign_keys=[product_id], back_populates="image", uselist=False
    )
    wooden_boards: Mapped[list["WoodenBoard"]] = relationship( # Renamed to plural for clarity
        back_populates="image"
        # uselist=True is implied by Mapped[list[...]]
    )
