import uuid
from datetime import datetime, date, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.week_plan import WeekPlan, PlanStatus
from app.models.task import Task
from app.schemas.week_plan import (
    WeekPlanCreate, WeekPlanRead, WeekPlanUpdate,
    GeneratePlanRequest,
)
from app.schemas.task import TaskRead
from app.services.llm_service import LLMService
from app.services.plan_service import PlanService

router = APIRouter()


def get_week_start(d: date) -> date:
    return d - timedelta(days=d.weekday())


@router.get("/current")
async def get_current_plan(
    target_date: date | None = Query(None, alias="date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    d = target_date or date.today()
    week_start = get_week_start(d)

    result = await db.execute(
        select(WeekPlan)
        .where(WeekPlan.user_id == current_user.id, WeekPlan.start_date == week_start)
        .options(selectinload(WeekPlan.tasks))
    )
    plan = result.scalar_one_or_none()

    if not plan:
        plan = WeekPlan(user_id=current_user.id, start_date=week_start, status=PlanStatus.DRAFT)
        db.add(plan)
        await db.commit()
        await db.refresh(plan)

    # Use eagerly loaded tasks from selectinload above (or empty for newly created plan)
    tasks = plan.tasks if plan.tasks else []

    return {
        "plan": WeekPlanRead.model_validate(plan),
        "tasks": [TaskRead.model_validate(t) for t in tasks],
    }


@router.post("", response_model=WeekPlanRead)
async def create_plan(
    body: WeekPlanCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    plan = WeekPlan(user_id=current_user.id, start_date=body.start_date)
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return WeekPlanRead.model_validate(plan)


@router.patch("/{plan_id}", response_model=WeekPlanRead)
async def update_plan(
    plan_id: uuid.UUID,
    body: WeekPlanUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WeekPlan).where(WeekPlan.id == plan_id, WeekPlan.user_id == current_user.id)
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    if body.status is not None:
        plan.status = body.status
        if body.status == PlanStatus.ACTIVE:
            plan.confirmed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(plan)
    return WeekPlanRead.model_validate(plan)


@router.post("/{plan_id}/generate")
async def generate_plan(
    plan_id: uuid.UUID,
    body: GeneratePlanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WeekPlan).where(WeekPlan.id == plan_id, WeekPlan.user_id == current_user.id)
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    service = PlanService(db, LLMService())
    tasks = await service.generate_plan(plan, body.intents, current_user.preferences)

    await db.refresh(plan)
    return {
        "plan": WeekPlanRead.model_validate(plan),
        "tasks": [TaskRead.model_validate(t) for t in tasks],
    }
