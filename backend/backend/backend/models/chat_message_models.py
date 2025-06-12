from datetime import datetime, timezone
from uuid import UUID

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.db import Base
from backend.models.buyer_models import Buyer
from backend.models.chat_thread_models import ChatThread
from backend.models.seller_models import Seller


class ChatMessage(Base):
    """ChatMessage model."""

    __tablename__ = "chat_message"

    id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), primary_key=True, unique=True, index=True
    )
    message: Mapped[str] = mapped_column(sa.String)
    is_read_by_buyer: Mapped[bool] = mapped_column(sa.Boolean, default=False)
    is_read_by_seller: Mapped[bool] = mapped_column(sa.Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    thread_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True),
        sa.ForeignKey("chat_thread.id", ondelete="CASCADE"),
        index=True,
    )
    buyer_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True), sa.ForeignKey("buyer.id", ondelete="CASCADE"), index=True
    )
    seller_id: Mapped[UUID] = mapped_column(
        sa.UUID(as_uuid=True),
        sa.ForeignKey("seller.id", ondelete="CASCADE"),
        index=True,
    )

    thread: Mapped[ChatThread] = relationship(
        foreign_keys=[thread_id], back_populates="chat_message", uselist=False
    )
    buyer: Mapped[Buyer] = relationship(
        foreign_keys=[buyer_id], back_populates="chat_message", uselist=False
    )
    seller: Mapped[Seller] = relationship(
        foreign_keys=[seller_id], back_populates="chat_message", uselist=False
    )
