from typing import TYPE_CHECKING
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base

if TYPE_CHECKING:
    from backend.models.product_models import Product
    from backend.models.wood_type_price_models import WoodTypePrice


class WoodType(Base):
    """WoodType model."""

    __tablename__ = "wood_type"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    neme: Mapped[str] = mapped_column(sa.String, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(sa.String)

    # Relationships
    product: Mapped[list["Product"]] = relationship(back_populates="wood_type")
    wood_type_price: Mapped[list["WoodTypePrice"]] = relationship(
        back_populates="wood_type"
    )
