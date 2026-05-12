import client from "./client";
import { Task, TodayTasks } from "../types/models";

export const apiTasks = {
  fetchToday: async (date?: string): Promise<TodayTasks> => {
    const params = date ? { date } : {};
    const { data } = await client.get("/tasks/today", { params });
    return data;
  },
  create: async (task: Partial<Task>): Promise<Task> => {
    const { data } = await client.post("/tasks", task);
    return data;
  },
  update: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const { data } = await client.patch(`/tasks/${taskId}`, updates);
    return data;
  },
  delete: async (taskId: string): Promise<void> => {
    await client.delete(`/tasks/${taskId}`);
  },
};
