from datetime import UTC, datetime
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from backend.db import Base


class Seller(Base):
    """Seller model."""

    __tablename__ = "seller"

    keycloak_uuid: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
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
