from pydantic import BaseModel
from fastapi import APIRouter, Depends
from app.deps import get_current_user
from app.models.user import User
from app.services.llm_service import LLMService

router = APIRouter()


class GeneratePlanBody(BaseModel):
    intents: list[dict] = []
    user_preferences: dict = {}


class AdjustTomorrowBody(BaseModel):
    unfinished_tasks: list[dict] = []
    tomorrow_plan: list[dict] = []


class WeeklyReportBody(BaseModel):
    week_data: dict = {}
    previous_week_score: int | None = None


@router.post("/generate-plan")
async def llm_generate_plan(
    body: GeneratePlanBody,
    current_user: User = Depends(get_current_user),
):
    svc = LLMService()
    return await svc.generate_plan(body.intents, body.user_preferences)


@router.post("/adjust-tomorrow")
async def llm_adjust_tomorrow(
    body: AdjustTomorrowBody,
    current_user: User = Depends(get_current_user),
):
    svc = LLMService()
    return await svc.adjust_tomorrow(body.unfinished_tasks, body.tomorrow_plan)


@router.post("/weekly-report")
async def llm_weekly_report(
    body: WeeklyReportBody,
    current_user: User = Depends(get_current_user),
):
    svc = LLMService()
    return await svc.weekly_report(body.week_data, body.previous_week_score)
