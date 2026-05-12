import logging
from datetime import date, timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task, TaskStatus
from app.models.week_plan import WeekPlan
from app.schemas.daily_review import RolloverRequest
from app.schemas.task import TaskRead
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class RolloverService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def process(self, request: RolloverRequest, user_id) -> dict:
        """Process evening rollover: mark unfinished tasks, auto-roll to tomorrow, rebalance."""
        today = request.date
        tomorrow = today + timedelta(days=1)

        rolled_over = []
        skipped = []
        reassessment_alerts = []

        for update in request.task_updates:
            result = await self.db.execute(
                select(Task).join(WeekPlan).where(Task.id == update.task_id, WeekPlan.user_id == user_id)
            )
            task = result.scalar_one_or_none()
            if not task:
                continue

            if update.status == TaskStatus.ROLLED_OVER:
                task.status = TaskStatus.ROLLED_OVER
                task.delay_reason = update.delay_reason
                task.completion_note = update.completion_note
                task.roll_over_count += 1
                task.is_rolled_over = True

                # Create a new copy for tomorrow (or update scheduled_date)
                # Actually, we create a new pending task for tomorrow
                new_task = Task(
                    week_plan_id=task.week_plan_id,
                    title=task.title,
                    description=task.description,
                    priority=task.priority,
                    estimated_duration=task.estimated_duration,
                    scheduled_date=tomorrow,
                    scheduled_time=task.scheduled_time,
                    status=TaskStatus.PENDING,
                    is_rolled_over=True,
                    roll_over_count=task.roll_over_count,
                )
                self.db.add(new_task)
                rolled_over.append(new_task)

                if task.roll_over_count >= 3:
                    reassessment_alerts.append({
                        "task_id": str(new_task.id),
                        "title": task.title,
                        "roll_count": task.roll_over_count,
                        "alert": "task_reassessment" if task.roll_over_count < 7 else "suggest_archive",
                    })

            elif update.status == TaskStatus.SKIPPED:
                task.status = TaskStatus.SKIPPED
                task.delay_reason = update.delay_reason
                task.completion_note = update.completion_note
                skipped.append(task)

        await self.db.commit()

        # Refresh rolled_over tasks
        for t in rolled_over:
            await self.db.refresh(t)

        # Get tomorrow's plan for reference
        tomorrow_result = await self.db.execute(
            select(Task).join(WeekPlan).where(
                WeekPlan.user_id == user_id,
                Task.scheduled_date == tomorrow,
                Task.status == TaskStatus.PENDING,
            )
        )
        tomorrow_tasks = tomorrow_result.scalars().all()

        # LLM rebalance if needed
        llm_svc = LLMService()
        if rolled_over:
            try:
                adjustment = await llm_svc.adjust_tomorrow(
                    [{"id": str(t.id), "title": t.title, "delay_reason": t.delay_reason.value if t.delay_reason else None} for t in rolled_over],
                    [{"id": str(t.id), "title": t.title, "priority": t.priority.value, "scheduled_time": str(t.scheduled_time) if t.scheduled_time else None} for t in tomorrow_tasks],
                )
            except Exception as e:
                logger.error(f"LLM adjustment failed in rollover: {e}")
                adjustment = {"coach_note": "任务已自动顺延至明天", "rolled_over_tasks": [], "suggested_removals": []}
        else:
            adjustment = {"coach_note": "所有任务已完成，今天表现不错！", "rolled_over_tasks": [], "suggested_removals": []}

        return {
            "rolled_over": [TaskRead.model_validate(t) for t in rolled_over],
            "skipped": [TaskRead.model_validate(t) for t in skipped],
            "tomorrow_plan": [TaskRead.model_validate(t) for t in tomorrow_tasks],
            "reassessment_alerts": reassessment_alerts,
            "adjustment": adjustment,
        }
