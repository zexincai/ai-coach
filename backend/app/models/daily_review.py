import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, TimestampMixin, UUIDMixin


class DailyReview(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "daily_reviews"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )
    date: Mapped[date] = mapped_column(Date, nullable=False)
    summary_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    mood_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    completed_tasks_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_tasks_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    rolled_over_tasks_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="daily_reviews")
