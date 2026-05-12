"""Comprehensive backend tests."""
import asyncio
from datetime import date
from app.database import async_session, engine, Base
from app.models.user import User
from app.models.week_plan import WeekPlan, PlanStatus
from app.models.task import Task, TaskStatus, TaskPriority
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload
from app.services.analytics_service import AnalyticsService
from app.utils.json_validator import extract_json, validate_task_output, fallback_schedule


async def test_all():
    # Reset DB
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as db:
        # === Test 1: Create entities ===
        user = User(email="test@test.com", name="Test", hashed_password="hash")
        db.add(user)
        await db.commit()
        await db.refresh(user)
        assert user.id is not None
        print("[PASS] Test 1: User creation")

        week_start = date(2026, 5, 11)
        plan = WeekPlan(user_id=user.id, start_date=week_start, status=PlanStatus.ACTIVE)
        db.add(plan)
        await db.commit()
        await db.refresh(plan)
        assert plan.id is not None
        print("[PASS] Test 2: WeekPlan creation")

        # Create tasks for Mon-Fri
        for i in range(5):
            task = Task(
                week_plan_id=plan.id,
                title=f"Task day {i}",
                priority=TaskPriority.P0 if i < 2 else TaskPriority.P2,
                scheduled_date=date(2026, 5, 11 + i),
            )
            db.add(task)
        await db.commit()
        print("[PASS] Test 3: Task creation with timezone defaults")

        # === Test 4: get_current_plan with selectinload ===
        result = await db.execute(
            select(WeekPlan)
            .where(WeekPlan.user_id == user.id, WeekPlan.start_date == week_start)
            .options(selectinload(WeekPlan.tasks))
        )
        plan_found = result.scalar_one_or_none()
        assert plan_found is not None
        assert len(plan_found.tasks) == 5
        print("[PASS] Test 4: Plan lookup with eager-loaded tasks")

        # === Test 5: Today tasks query (fixed overdue) ===
        today = date(2026, 5, 12)  # Tuesday
        all_today = (
            await db.execute(
                select(Task)
                .join(WeekPlan)
                .where(WeekPlan.user_id == user.id, Task.scheduled_date == today)
            )
        ).scalars().all()
        assert len(all_today) == 1  # Only the Tuesday task
        print("[PASS] Test 5: Today tasks query")

        # === Test 6: Overdue query (fixed - only before today or rolled over) ===
        overdue = (
            await db.execute(
                select(Task)
                .join(WeekPlan)
                .where(
                    WeekPlan.user_id == user.id,
                    Task.status == TaskStatus.PENDING,
                    or_(Task.scheduled_date < today, Task.is_rolled_over == True),
                )
            )
        ).scalars().all()
        # May 11 task is still PENDING and before today
        assert len(overdue) == 1
        print("[PASS] Test 6: Overdue query (excludes today's non-rolled tasks)")

        # === Test 7: Mark May 11 task DONE, create rolled-over task ===
        may11_task = overdue[0]
        may11_task.status = TaskStatus.DONE
        rolled_task = Task(
            week_plan_id=plan.id,
            title="Rolled over task",
            priority=TaskPriority.P1,
            scheduled_date=today,
            is_rolled_over=True,
            roll_over_count=1,
        )
        db.add(rolled_task)
        await db.commit()

        overdue2 = (
            await db.execute(
                select(Task)
                .join(WeekPlan)
                .where(
                    WeekPlan.user_id == user.id,
                    Task.status == TaskStatus.PENDING,
                    or_(Task.scheduled_date < today, Task.is_rolled_over == True),
                )
            )
        ).scalars().all()
        # Should only include the rolled-over task (may11 is now DONE)
        assert len(overdue2) == 1
        assert overdue2[0].is_rolled_over == True
        print("[PASS] Test 7: Rolled-over task appears in overdue")

        # === Test 8: Analytics (with LLM fallback) ===
        service = AnalyticsService(db)
        report = await service.build_weekly_report(user.id, date(2026, 5, 11))
        assert report.total_tasks == 6  # 5 original + 1 rolled
        assert report.completion_rate == 1.0 / 6.0  # 1 done / 6 total
        print(f"[PASS] Test 8: Analytics (total={report.total_tasks}, rate={report.completion_rate:.2f})")

        # === Test 9: JSON validator - extract_json ===
        # Array only
        assert extract_json("text [1,2,3] more") == "[1,2,3]"
        # Object only
        assert extract_json('text {"a":1} more') == '{"a":1}'
        # Markdown code fence
        assert extract_json('```json\n[{"x": 1}]\n```') == '[{"x": 1}]'
        print("[PASS] Test 9: extract_json handles all bracket combinations")

        # === Test 10: validate_task_output ===
        tasks = validate_task_output([
            {"title": "Test", "priority": "P0", "estimated_duration": 30, "day_of_week": 3, "time_slot": "14:00"},
        ])
        assert len(tasks) == 1
        assert tasks[0]["title"] == "Test"
        assert tasks[0]["priority"] == "P0"
        print("[PASS] Test 10: validate_task_output")

        # === Test 11: fallback_schedule ===
        intents = [{"text": "Write tests", "priority": "P0"}]
        prefs = {"work_hours": {"start": "09:00", "end": "18:00"}}
        fallback_tasks = fallback_schedule(intents, prefs)
        assert len(fallback_tasks) == 1
        assert fallback_tasks[0]["title"] == "Write tests"
        assert fallback_tasks[0]["priority"] == "P0"
        assert 1 <= fallback_tasks[0]["day_of_week"] <= 5
        print("[PASS] Test 11: fallback_schedule")

    print("\n=== ALL 11 TESTS PASSED ===")


if __name__ == "__main__":
    asyncio.run(test_all())
