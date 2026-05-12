"""
JSON output validator for LLM responses.
Handles markdown code fences, missing fields, invalid enum values.
Falls back to rule-based scheduling after 3 failures.
"""

import json
import re
import logging

logger = logging.getLogger(__name__)


def extract_json(text: str) -> str:
    """Extract JSON from LLM output, handling markdown fences and extra text."""
    text = text.strip()

    # Try to extract from markdown code block
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if fence_match:
        return fence_match.group(1).strip()

    # Try to find JSON array or object bounds
    # Find first [ or { and last ] or }
    idx_bracket = text.find("[")
    idx_brace = text.find("{")
    if idx_bracket != -1 and idx_brace != -1:
        first_bracket = min(idx_bracket, idx_brace)
    elif idx_bracket != -1:
        first_bracket = idx_bracket
    elif idx_brace != -1:
        first_bracket = idx_brace
    else:
        first_bracket = -1
    last_bracket = max(text.rfind("]"), text.rfind("}"))

    if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
        return text[first_bracket : last_bracket + 1]

    return text


def validate_task_output(data: dict | list) -> list[dict]:
    """Validate LLM task generation output against expected schema."""
    tasks = data if isinstance(data, list) else data.get("tasks", [])

    validated = []
    for i, task in enumerate(tasks):
        if not isinstance(task, dict):
            continue
        validated_task = {
            "title": str(task.get("title", f"Task {i+1}")),
            "description": str(task.get("description", "")),
            "priority": task.get("priority", "P2") if task.get("priority") in ("P0", "P1", "P2") else "P2",
            "estimated_duration": min(max(int(task.get("estimated_duration", 60)), 15), 120),
            "day_of_week": min(max(int(task.get("day_of_week", 1)), 1), 5),
            "time_slot": str(task.get("time_slot", "09:00")),
        }
        validated.append(validated_task)

    return validated


def fallback_schedule(intents: list[dict], preferences: dict) -> list[dict]:
    """Rule-based fallback: evenly distribute tasks across weekdays."""
    days = list(range(1, 6))  # Mon-Fri
    slots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]
    tasks = []

    for i, intent in enumerate(intents):
        day_idx = i % 5
        slot_idx = i % 6
        tasks.append({
            "title": intent.get("text", f"Task {i+1}"),
            "description": "",
            "priority": intent.get("priority", "P2"),
            "estimated_duration": 60,
            "day_of_week": days[day_idx],
            "time_slot": slots[slot_idx],
        })

    return tasks
