import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum as SAEnum, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base, TimestampMixin, UUIDMixin


class PlanStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"


class WeekPlan(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "week_plans"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("users.id"), nullable=False, index=True
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[PlanStatus] = mapped_column(
        SAEnum(PlanStatus), default=PlanStatus.DRAFT, nullable=False
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="week_plans")
    tasks = relationship("Task", back_populates="week_plan", cascade="all, delete-orphan")
