from pydantic import BaseModel


class DelayPattern(BaseModel):
    reason: str
    percentage: float


class PeakEnergyPeriod(BaseModel):
    time_slot: str
    completion_rate: float


class ImprovementSuggestion(BaseModel):
    title: str
    description: str
    icon: str = "check_circle"


class WeeklyReportResponse(BaseModel):
    completion_rate: float
    total_tasks: int
    completed_tasks: int
    peak_energy_periods: list[PeakEnergyPeriod] = []
    delay_patterns: list[DelayPattern] = []
    score: int | None = None
    score_trend: str = "0"
    main_pattern: str = ""
    suggestions: list[ImprovementSuggestion] = []
