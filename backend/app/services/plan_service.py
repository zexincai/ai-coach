import logging
from datetime import date, time, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.week_plan import WeekPlan
from app.models.task import Task, TaskPriority
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class PlanService:
    def __init__(self, db: AsyncSession, llm: LLMService):
        self.db = db
        self.llm = llm

    async def generate_plan(
        self, plan: WeekPlan, intents: list, preferences: dict
    ) -> list[Task]:
        """Generate tasks from user intents using LLM and save to database."""
        # Call LLM
        intents_dict = [i.model_dump() if hasattr(i, "model_dump") else i for i in intents]
        result = await self.llm.generate_plan(intents_dict, preferences)
        llm_tasks = result.get("tasks", [])

        # Delete existing draft tasks
        from sqlalchemy import delete
        await self.db.execute(delete(Task).where(Task.week_plan_id == plan.id))

        # Create new tasks
        tasks = []
        week_start = plan.start_date

        for t in llm_tasks:
            day_offset = t.get("day_of_week", 1) - 1  # 1=Monday -> offset 0
            task_date = week_start + timedelta(days=day_offset)

            time_str = t.get("time_slot", "09:00")
            try:
                hour, minute = map(int, time_str.split(":"))
                task_time = time(hour, minute)
            except (ValueError, TypeError):
                task_time = time(9, 0)

            task = Task(
                week_plan_id=plan.id,
                title=t["title"],
                description=t.get("description", ""),
                priority=t.get("priority", TaskPriority.P2),
                estimated_duration=t.get("estimated_duration", 60),
                scheduled_date=task_date,
                scheduled_time=task_time,
            )
            self.db.add(task)
            tasks.append(task)

        await self.db.commit()
        for task in tasks:
            await self.db.refresh(task)

        return tasks
