import logging
from datetime import date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.task import Task, TaskStatus
from app.models.week_plan import WeekPlan
from app.schemas.analytics import (
    WeeklyReportResponse, DelayPattern, PeakEnergyPeriod, ImprovementSuggestion,
)
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def build_weekly_report(self, user_id, week_start: date) -> WeeklyReportResponse:
        # Get all tasks for this week
        result = await self.db.execute(
            select(Task)
            .join(WeekPlan)
            .where(
                WeekPlan.user_id == user_id,
                WeekPlan.start_date == week_start,
            )
        )
        tasks = result.scalars().all()

        total = len(tasks)
        done = sum(1 for t in tasks if t.status == TaskStatus.DONE)
        rolled = sum(1 for t in tasks if t.status == TaskStatus.ROLLED_OVER)

        completion_rate = done / total if total > 0 else 0.0

        # Delay patterns
        delay_counts = {}
        for t in tasks:
            if t.delay_reason:
                reason = t.delay_reason.value
                delay_counts[reason] = delay_counts.get(reason, 0) + 1

        total_delays = sum(delay_counts.values())
        delay_patterns = [
            DelayPattern(reason=reason, percentage=round(count / total_delays, 2))
            for reason, count in delay_counts.items()
        ] if total_delays > 0 else []

        # Peak energy: bin completed tasks by time slot
        time_bins = {}
        for t in tasks:
            if t.status == TaskStatus.DONE and t.scheduled_time:
                hour = t.scheduled_time.hour
                slot = f"{hour:02d}:00"
                time_bins[slot] = time_bins.get(slot, 0) + 1

        max_completions = max(time_bins.values()) if time_bins else 1
        peak_energy = [
            PeakEnergyPeriod(
                time_slot=slot,
                completion_rate=round(count / max_completions, 2),
            )
            for slot, count in sorted(time_bins.items())
        ]

        # LLM analysis
        week_data = {
            "total_tasks": total,
            "completed_tasks": done,
            "rolled_over": rolled,
            "completion_rate": completion_rate,
            "delay_patterns": [d.model_dump() for d in delay_patterns],
        }

        llm = LLMService()
        try:
            analysis = await llm.weekly_report(week_data)
        except Exception as e:
            logger.error(f"LLM weekly report failed: {e}")
            analysis = {
                "score": None, "score_trend": "0", "main_pattern": "",
                "suggestions": [],
            }

        suggestions = [
            ImprovementSuggestion(**s)
            for s in analysis.get("suggestions", [])
        ]

        return WeeklyReportResponse(
            completion_rate=completion_rate,
            total_tasks=total,
            completed_tasks=done,
            peak_energy_periods=peak_energy,
            delay_patterns=delay_patterns,
            score=analysis.get("score"),
            score_trend=analysis.get("score_trend", "0"),
            main_pattern=analysis.get("main_pattern", ""),
            suggestions=suggestions,
        )
