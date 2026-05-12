import uuid
from datetime import date
from pydantic import BaseModel
from app.models.task import DelayReason, TaskStatus


class DailyReviewCreate(BaseModel):
    date: date
    mood_score: int | None = None
    summary_text: str | None = None


class DailyReviewRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    summary_text: str | None = None
    mood_score: int | None = None
    completed_tasks_count: int
    total_tasks_count: int
    rolled_over_tasks_count: int

    class Config:
        from_attributes = True


class TaskRolloverUpdate(BaseModel):
    task_id: uuid.UUID
    status: TaskStatus = TaskStatus.ROLLED_OVER
    delay_reason: DelayReason | None = None
    completion_note: str | None = None


class RolloverRequest(BaseModel):
    date: date
    task_updates: list[TaskRolloverUpdate]
