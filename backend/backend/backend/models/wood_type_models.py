from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from backend.db import Base


class WoodType(Base):
    """WoodType model."""

    __tablename__ = "wood_type"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    neme: Mapped[str] = mapped_column(sa.String, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(sa.String)
