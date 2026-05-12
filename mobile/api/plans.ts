import client from "./client";
import { WeekPlan, Task, IntentInput } from "../types/models";

interface CurrentPlanResponse {
  plan: WeekPlan;
  tasks: Task[];
}

interface GenerateResponse {
  plan: WeekPlan;
  tasks: Task[];
}

export const apiPlans = {
  fetchCurrent: async (date?: string): Promise<CurrentPlanResponse> => {
    const params = date ? { date } : {};
    const { data } = await client.get("/plans/current", { params });
    return data;
  },
  create: async (startDate: string): Promise<WeekPlan> => {
    const { data } = await client.post("/plans", { start_date: startDate });
    return data;
  },
  update: async (planId: string, status: string): Promise<WeekPlan> => {
    const { data } = await client.patch(`/plans/${planId}`, { status });
    return data;
  },
  generate: async (planId: string, intents: IntentInput[]): Promise<GenerateResponse> => {
    const { data } = await client.post(`/plans/${planId}/generate`, { intents });
    return data;
  },
};
