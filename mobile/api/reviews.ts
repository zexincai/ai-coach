import client from "./client";
import { Task, DailyReview, DelayReason } from "../types/models";

interface TaskRolloverUpdate {
  task_id: string;
  status: "rolled_over" | "skipped";
  delay_reason?: DelayReason;
  completion_note?: string;
}

interface RolloverResponse {
  rolled_over: Task[];
  skipped: Task[];
  tomorrow_plan: Task[];
  reassessment_alerts: any[];
  adjustment: any;
}

export const apiReviews = {
  submitReview: async (date: string, moodScore?: number, summaryText?: string): Promise<DailyReview> => {
    const { data } = await client.post("/reviews/daily", {
      date,
      mood_score: moodScore,
      summary_text: summaryText,
    });
    return data;
  },
  submitRollover: async (date: string, taskUpdates: TaskRolloverUpdate[]): Promise<RolloverResponse> => {
    const { data } = await client.post("/reviews/rollover", {
      date,
      task_updates: taskUpdates,
    });
    return data;
  },
};
