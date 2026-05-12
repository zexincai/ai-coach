import uuid
from datetime import date, datetime
from pydantic import BaseModel
from app.models.week_plan import PlanStatus


class WeekPlanCreate(BaseModel):
    start_date: date


class WeekPlanRead(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    start_date: date
    status: PlanStatus
    confirmed_at: datetime | None = None

    class Config:
        from_attributes = True


class WeekPlanUpdate(BaseModel):
    status: PlanStatus | None = None


class IntentInput(BaseModel):
    text: str
    priority: str = "P1"  # P0 | P1 | P2


class GeneratePlanRequest(BaseModel):
    intents: list[IntentInput]
