import uuid
from datetime import date, datetime, time, timezone

from sqlalchemy import Boolean, Date, DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text, Time, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.database import Base, UUIDMixin


class TaskPriority(str, enum.Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"


class TaskStatus(str, enum.Enum):
    PENDING = "pending"
    DONE = "done"
    SKIPPED = "skipped"
    ROLLED_OVER = "rolled_over"


class DelayReason(str, enum.Enum):
    UNDERESTIMATED = "underestimated"
    INTERRUPTED = "interrupted"
    PROCRASTINATED = "procrastinated"
    TOO_HARD = "too_hard"


class Task(Base, UUIDMixin):
    __tablename__ = "tasks"

    week_plan_id: Mapped[uuid.UUID] = mapped_column(
        Uuid, ForeignKey("week_plans.id"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    priority: Mapped[TaskPriority] = mapped_column(
        SAEnum(TaskPriority), default=TaskPriority.P2, nullable=False
    )
    estimated_duration: Mapped[int] = mapped_column(
        Integer, default=60, nullable=False
    )  # minutes
    actual_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    scheduled_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(
        SAEnum(TaskStatus), default=TaskStatus.PENDING, nullable=False
    )
    delay_reason: Mapped[DelayReason | None] = mapped_column(
        SAEnum(DelayReason), nullable=True
    )
    completion_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    roll_over_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_rolled_over: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

    week_plan = relationship("WeekPlan", back_populates="tasks")
