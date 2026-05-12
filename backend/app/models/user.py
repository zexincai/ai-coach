from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, TimestampMixin, UUIDMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    preferences: Mapped[dict] = mapped_column(JSON, default=lambda: {
        "work_hours": {"start": "09:00", "end": "18:00"},
        "peak_energy_time": "morning",
        "notification_enabled": True,
        "learning_mode_enabled": False,
    })

    week_plans = relationship("WeekPlan", back_populates="user")
    daily_reviews = relationship("DailyReview", back_populates="user")
