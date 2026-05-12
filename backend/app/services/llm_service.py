"""
LLM Service abstraction layer.
Supports OpenAI and Anthropic providers with timeout, retry, and fallback.
"""

import json
import logging
from app.config import settings
from app.utils.prompts import (
    PROMPT_TASK_DECOMPOSITION,
    PROMPT_DYNAMIC_ADJUSTMENT,
    PROMPT_WEEKLY_REPORT,
)
from app.utils.json_validator import extract_json, validate_task_output, fallback_schedule

logger = logging.getLogger(__name__)

# Lazy-loaded client singletons (reused across calls)
_openai_client = None
_anthropic_client = None


def _get_openai_client():
    global _openai_client
    if _openai_client is None:
        from openai import AsyncOpenAI
        _openai_client = AsyncOpenAI(api_key=settings.openai_api_key, timeout=settings.llm_timeout)
    return _openai_client


def _get_anthropic_client():
    global _anthropic_client
    if _anthropic_client is None:
        from anthropic import AsyncAnthropic
        _anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key, timeout=settings.llm_timeout)
    return _anthropic_client


class LLMService:
    def __init__(self):
        self.provider = settings.llm_provider
        self.model = settings.llm_model
        self.timeout = settings.llm_timeout
        self.max_retries = settings.llm_max_retries

    async def _call_llm(self, prompt: str, retries: int = 0) -> str:
        """Call LLM with provider abstraction and retry logic."""
        last_error = None

        for attempt in range(retries + 1):
            try:
                if self.provider == "openai":
                    return await self._call_openai(prompt)
                elif self.provider == "anthropic":
                    return await self._call_anthropic(prompt)
                else:
                    return await self._call_openai(prompt)
            except Exception as e:
                last_error = e
                logger.warning(f"LLM call attempt {attempt + 1} failed: {e}")
                if attempt < retries:
                    continue

        raise last_error or RuntimeError("LLM call failed")

    async def _call_openai(self, prompt: str) -> str:
        client = _get_openai_client()
        response = await client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=2000,
        )
        return response.choices[0].message.content or ""

    async def _call_anthropic(self, prompt: str) -> str:
        client = _get_anthropic_client()
        response = await client.messages.create(
            model=self.model or "claude-sonnet-4-20250514",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text

    async def generate_plan(self, intents: list[dict], preferences: dict) -> dict:
        """Generate a weekly plan from user intents using LLM."""
        prompt = PROMPT_TASK_DECOMPOSITION.format(
            user_intents=json.dumps(intents, ensure_ascii=False),
            priorities="P0=紧急重要, P1=重要不紧急, P2=琐事",
            preferences=json.dumps(preferences, ensure_ascii=False),
        )

        try:
            raw = await self._call_llm(prompt, retries=self.max_retries)
            data = json.loads(extract_json(raw))
            tasks = validate_task_output(data)
            return {"tasks": tasks}
        except Exception as e:
            logger.error(f"LLM plan generation failed, using fallback: {e}")
            tasks = fallback_schedule(intents, preferences)
            return {"tasks": tasks}

    async def adjust_tomorrow(self, unfinished_tasks: list[dict], tomorrow_plan: list[dict]) -> dict:
        """Dynamically adjust tomorrow's plan based on today's unfinished tasks."""
        reasons = [t.get("delay_reason", "unknown") for t in unfinished_tasks]

        prompt = PROMPT_DYNAMIC_ADJUSTMENT.format(
            unfinished_tasks=json.dumps(unfinished_tasks, ensure_ascii=False),
            reasons=json.dumps(reasons, ensure_ascii=False),
            tomorrow_plan=json.dumps(tomorrow_plan, ensure_ascii=False),
        )

        try:
            raw = await self._call_llm(prompt, retries=1)
            data = json.loads(extract_json(raw))
            return data
        except Exception as e:
            logger.error(f"LLM adjustment failed: {e}")
            return {
                "rolled_over_tasks": [
                    {"task_id": t.get("id"), "suitable_for_tomorrow": True, "suggested_time": "14:00"}
                    for t in unfinished_tasks
                ],
                "suggested_removals": [],
                "tomorrow_load_assessment": "任务已纳入明日计划",
                "coach_note": "未完成任务已自动顺延，明天继续加油！",
            }

    async def weekly_report(self, week_data: dict, previous_score: int | None = None) -> dict:
        """Generate weekly evolution report."""
        prompt = PROMPT_WEEKLY_REPORT.format(
            week_data=json.dumps(week_data, ensure_ascii=False),
            delay_patterns=json.dumps(week_data.get("delay_patterns", []), ensure_ascii=False),
            user_notes=json.dumps(week_data.get("user_notes", ""), ensure_ascii=False),
            previous_score=str(previous_score) if previous_score else "N/A",
        )

        try:
            raw = await self._call_llm(prompt, retries=1)
            data = json.loads(extract_json(raw))
            return data
        except Exception as e:
            logger.error(f"LLM weekly report failed: {e}")
            return {
                "score": 7,
                "score_trend": "0",
                "main_pattern": "本周数据不足，尚无法形成稳定模式分析",
                "suggestions": [
                    {"title": "保持一致", "description": "坚持每日复盘，让系统更好地了解你的节奏", "icon": "trending_up"},
                    {"title": "记录耗时", "description": "记录任务实际耗时，帮助提升预估准确度", "icon": "schedule"},
                    {"title": "善用优先级", "description": "区分P0/P1/P2任务，优先完成高价值事项", "icon": "check_circle"},
                ],
                "closing_note": "每一周的坚持都在沉淀，继续前行！",
            }
