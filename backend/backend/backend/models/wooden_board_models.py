from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base
from backend.models.image_models import Image


class WoodenBoard(Base):
    """WoodenBoard model."""

    __tablename__ = "wooden_board"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    height: Mapped[float] = mapped_column(sa.Float)
    width: Mapped[float] = mapped_column(sa.Float)
    lenght: Mapped[float] = mapped_column(sa.Float)
    image_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), sa.ForeignKey("image.id", ondelete="CASCADE"), index=True
    )

    image: Mapped[Image] = relationship(
        foreign_keys=[image_id], back_populates="wooden_boards", uselist=False # Changed back_populates
    )
