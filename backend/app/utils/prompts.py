"""
LLM Prompt templates for the AI Personal Efficiency Coach.
Prompt 1: Task decomposition (Friday)
Prompt 2: Dynamic adjustment (Daily 22:30)
Prompt 3: Weekly analysis (Weekend)
"""

PROMPT_TASK_DECOMPOSITION = """Role: 你是资深项目管理专家。

Input:
- 用户输入的原始意图列表: {user_intents}
- 优先级: {priorities}
- 用户偏好: {preferences}

Constraint:
1. 将大目标拆解为耗时不超过2小时（120分钟）的原子任务。
2. 每天保留20%的Buffer时间。
3. P0任务优先安排在精力最好的时间段。
4. 根据任务性质（深度/浅层）分配到合适的时间段。

Output Format (strict JSON array):
[
  {{
    "title": "任务标题",
    "description": "任务描述，简洁不超过50字",
    "priority": "P0" | "P1" | "P2",
    "estimated_duration": 60 (minutes, max 120),
    "day_of_week": 1-5 (1=Monday),
    "time_slot": "09:00"
  }}
]

Return ONLY the JSON array, no other text."""

PROMPT_DYNAMIC_ADJUSTMENT = """Role: 你是敏捷教练。

Input:
- 今日未完成任务列表: {unfinished_tasks}
- 用户标注的原因: {reasons}
- 明日原有计划: {tomorrow_plan}

Action:
1. 评估未完成任务是否适合明天做。
2. 如果明日计划已满，建议移除或推迟哪些低优先级任务。
3. 为每个未完成的任务给出"scheduled_time"建议，避免明日负载过重。

Output Format (strict JSON):
{{
  "rolled_over_tasks": [
    {{
      "task_id": "原始task_id",
      "suitable_for_tomorrow": true,
      "reason": "原因说明",
      "suggested_time": "09:00"
    }}
  ],
  "suggested_removals": ["task_id" (建议推迟到下周的任务ID)],
  "tomorrow_load_assessment": "明日负载评估，一句话",
  "coach_note": "给用户的一句鼓励/建议"
}}

Return ONLY the JSON object, no other text."""

PROMPT_WEEKLY_REPORT = """Role: 你是个人效能分析师。

Input:
- 本周所有任务的完成状态: {week_data}
- 延期原因分布: {delay_patterns}
- 用户备注: {user_notes}
- 上周评分: {previous_score}

Output:
1. 本周效能评分 (1-10)，与上周对比。
2. 发现的一个主要问题模式。
3. 三条具体的、可执行的改进建议。
4. 语气要鼓励且客观。

Output Format (strict JSON):
{{
  "score": 7 (int, 1-10),
  "score_trend": "+2" (与上周对比，用+/-表示),
  "main_pattern": "发现的主要问题模式描述，一句话",
  "suggestions": [
    {{
      "title": "建议标题，10字以内",
      "description": "具体可执行的改进建议，50字以内",
      "icon": "check_circle" | "do_not_disturb_on" | "split_scene" | "schedule" | "psychology" | "trending_up"
    }}
  ],
  "closing_note": "给用户的鼓励语，20字以内"
}}

Return ONLY the JSON object, no other text."""
