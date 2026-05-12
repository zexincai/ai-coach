import { create } from "zustand";
import { Task, DelayReason } from "../types/models";
import { apiTasks } from "../api/tasks";

interface TaskState {
  coreTasks: Task[];
  remainingTasks: Task[];
  overdueTasks: Task[];
  morningMessage: string;
  isLoading: boolean;
  error: string | null;

  fetchTodayData: (date?: string) => Promise<void>;
  toggleComplete: (taskId: string) => Promise<void>;
  updateOverdueTask: (taskId: string, reason: DelayReason) => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  coreTasks: [],
  remainingTasks: [],
  overdueTasks: [],
  morningMessage: "",
  isLoading: false,
  error: null,

  fetchTodayData: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiTasks.fetchToday(date);
      set({
        coreTasks: data.core_tasks,
        remainingTasks: data.remaining_tasks,
        overdueTasks: data.overdue_tasks,
        morningMessage: data.morning_message,
        isLoading: false,
      });
    } catch (e: any) {
      set({
        isLoading: false,
        error: e?.response?.data?.detail || "加载今日数据失败，请检查网络连接",
      });
    }
  },

  toggleComplete: async (taskId) => {
    // Optimistic update
    const isCore = get().coreTasks.some((t) => t.id === taskId);
    if (isCore) {
      set({ coreTasks: get().coreTasks.filter((t) => t.id !== taskId) });
    } else {
      set({ remainingTasks: get().remainingTasks.filter((t) => t.id !== taskId) });
    }
    try {
      await apiTasks.update(taskId, { status: "done" } as any);
    } catch {
      // Refetch on failure to restore correct state
      await get().fetchTodayData();
    }
  },

  updateOverdueTask: async (taskId, reason) => {
    await apiTasks.update(taskId, { delay_reason: reason } as any);
    set({
      overdueTasks: get().overdueTasks.map((t) =>
        t.id === taskId ? { ...t, delay_reason: reason } : t
      ),
    });
  },

  clearError: () => set({ error: null }),
}));
