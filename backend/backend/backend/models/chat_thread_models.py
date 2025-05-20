from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base
from backend.models.buyer_models import Buyer
from backend.models.seller_models import Seller

if TYPE_CHECKING:
    from backend.models.chat_message_models import ChatMessage


class ChatThread(Base):
    """ChatThread model."""

    __tablename__ = "chat_thread"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=datetime.now(UTC)
    )
    buyer_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), sa.ForeignKey("buyer.id", ondelete="CASCADE"), index=True
    )
    seller_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True),
        sa.ForeignKey("seller.id", ondelete="CASCADE"),
        index=True,
    )

    buyer: Mapped[Buyer] = relationship(
        foreign_keys=[buyer_id], back_populates="chat_thread", uselist=False
    )
    seller: Mapped[Seller] = relationship(
        foreign_keys=[seller_id], back_populates="chat_thread", uselist=False
    )
    chat_message: Mapped[list["ChatMessage"]] = relationship(back_populates="thread")
