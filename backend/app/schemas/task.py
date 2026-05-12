import uuid
from datetime import date, time
from pydantic import BaseModel
from app.models.task import TaskPriority, TaskStatus, DelayReason


class TaskCreate(BaseModel):
    week_plan_id: uuid.UUID
    title: str
    description: str | None = None
    priority: TaskPriority = TaskPriority.P2
    estimated_duration: int = 60
    scheduled_date: date
    scheduled_time: time | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    priority: TaskPriority | None = None
    estimated_duration: int | None = None
    scheduled_date: date | None = None
    scheduled_time: time | None = None
    status: TaskStatus | None = None
    actual_duration: int | None = None
    delay_reason: DelayReason | None = None
    completion_note: str | None = None


class TaskRead(BaseModel):
    id: uuid.UUID
    week_plan_id: uuid.UUID
    title: str
    description: str | None = None
    priority: TaskPriority
    estimated_duration: int
    actual_duration: int | None = None
    scheduled_date: date
    scheduled_time: time | None = None
    status: TaskStatus
    delay_reason: DelayReason | None = None
    completion_note: str | None = None
    roll_over_count: int = 0
    is_rolled_over: bool = False

    class Config:
        from_attributes = True


class TodayTasksResponse(BaseModel):
    core_tasks: list[TaskRead] = []
    remaining_tasks: list[TaskRead] = []
    overdue_tasks: list[TaskRead] = []
    morning_message: str = ""
