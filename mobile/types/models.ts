export interface User {
  id: string;
  email: string;
  name: string;
  preferences: UserPreferences;
  created_at: string;
}

export interface UserPreferences {
  work_hours: { start: string; end: string };
  peak_energy_time: "morning" | "afternoon" | "evening";
  notification_enabled: boolean;
  learning_mode_enabled: boolean;
}

export interface WeekPlan {
  id: string;
  user_id: string;
  start_date: string;
  status: "draft" | "active" | "closed";
  confirmed_at: string | null;
}

export type TaskPriority = "P0" | "P1" | "P2";
export type TaskStatus = "pending" | "done" | "skipped" | "rolled_over";
export type DelayReason = "underestimated" | "interrupted" | "procrastinated" | "too_hard";

export interface Task {
  id: string;
  week_plan_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  estimated_duration: number;
  actual_duration: number | null;
  scheduled_date: string;
  scheduled_time: string | null;
  status: TaskStatus;
  delay_reason: DelayReason | null;
  completion_note: string | null;
  roll_over_count: number;
  is_rolled_over: boolean;
}

export interface TodayTasks {
  core_tasks: Task[];
  remaining_tasks: Task[];
  overdue_tasks: Task[];
  morning_message: string;
}

export interface DailyReview {
  id: string;
  user_id: string;
  date: string;
  summary_text: string | null;
  mood_score: number | null;
  completed_tasks_count: number;
  total_tasks_count: number;
  rolled_over_tasks_count: number;
}

export interface WeeklyReport {
  completion_rate: number;
  total_tasks: number;
  completed_tasks: number;
  peak_energy_periods: PeakEnergyPeriod[];
  delay_patterns: DelayPattern[];
  score: number | null;
  score_trend: string;
  main_pattern: string;
  suggestions: ImprovementSuggestion[];
}

export interface PeakEnergyPeriod {
  time_slot: string;
  completion_rate: number;
}

export interface DelayPattern {
  reason: string;
  percentage: number;
}

export interface ImprovementSuggestion {
  title: string;
  description: string;
  icon: string;
}

export interface IntentInput {
  text: string;
  priority: TaskPriority;
}
