import uuid
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.week_plan import WeekPlan
from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskUpdate, TaskRead, TodayTasksResponse

router = APIRouter()


@router.get("/today", response_model=TodayTasksResponse)
async def get_today_tasks(
    target_date: date | None = Query(None, alias="date"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    d = target_date or date.today()

    # Get today's tasks
    result = await db.execute(
        select(Task)
        .join(WeekPlan)
        .where(WeekPlan.user_id == current_user.id, Task.scheduled_date == d)
        .order_by(Task.priority, Task.scheduled_time)
    )
    all_today = result.scalars().all()

    core = [t for t in all_today if t.priority in ("P0", "P1") and t.status == TaskStatus.PENDING and not t.is_rolled_over]
    remaining = [t for t in all_today if t.priority == "P2" and t.status == TaskStatus.PENDING and not t.is_rolled_over]

    # Get overdue: tasks scheduled before today that are still PENDING, plus rolled-over tasks
    overdue_result = await db.execute(
        select(Task)
        .join(WeekPlan)
        .where(
            WeekPlan.user_id == current_user.id,
            Task.status == TaskStatus.PENDING,
            or_(
                Task.scheduled_date < d,
                Task.is_rolled_over == True,
            ),
        )
        .order_by(Task.scheduled_date, Task.roll_over_count.desc())
    )
    overdue = overdue_result.scalars().all()

    morning_message = generate_morning_message(core, overdue)

    return TodayTasksResponse(
        core_tasks=[TaskRead.model_validate(t) for t in core],
        remaining_tasks=[TaskRead.model_validate(t) for t in remaining],
        overdue_tasks=[TaskRead.model_validate(t) for t in overdue],
        morning_message=morning_message,
    )


def generate_morning_message(core_tasks: list[Task], overdue_tasks: list[Task]) -> str:
    if not core_tasks and not overdue_tasks:
        return "今天没有待办任务，享受轻松的一天吧。"
    if overdue_tasks:
        return f"昨天有 {len(overdue_tasks)} 项任务需要关注，让我们一起迎头赶上。"
    return "让今天成为你掌控专注力的一天。"


@router.get("/plan/{plan_id}", response_model=list[TaskRead])
async def get_plan_tasks(
    plan_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(WeekPlan).where(WeekPlan.id == plan_id, WeekPlan.user_id == current_user.id)
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    tasks_result = await db.execute(
        select(Task).where(Task.week_plan_id == plan_id).order_by(Task.scheduled_date, Task.scheduled_time)
    )
    return [TaskRead.model_validate(t) for t in tasks_result.scalars().all()]


@router.post("", response_model=TaskRead)
async def create_task(
    body: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify the week plan belongs to the current user
    plan_result = await db.execute(
        select(WeekPlan).where(WeekPlan.id == body.week_plan_id, WeekPlan.user_id == current_user.id)
    )
    if not plan_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Plan not found")

    task = Task(**body.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return TaskRead.model_validate(task)


@router.patch("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: uuid.UUID,
    body: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).join(WeekPlan).where(Task.id == task_id, WeekPlan.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    await db.commit()
    await db.refresh(task)
    return TaskRead.model_validate(task)


@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Task).join(WeekPlan).where(Task.id == task_id, WeekPlan.user_id == current_user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()
