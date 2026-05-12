import { create } from "zustand";
import { WeekPlan, Task, IntentInput } from "../types/models";
import { apiPlans } from "../api/plans";
import { apiTasks } from "../api/tasks";

interface WeekPlanState {
  currentPlan: WeekPlan | null;
  tasks: Task[];
  isGenerating: boolean;
  isLoading: boolean;
  error: string | null;

  fetchCurrentWeek: (date?: string) => Promise<void>;
  generatePlanFromIntents: (intents: IntentInput[]) => Promise<void>;
  confirmPlan: () => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  moveTask: (taskId: string, toDate: string, toTime?: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  clearError: () => void;
}

export const useWeekPlanStore = create<WeekPlanState>((set, get) => ({
  currentPlan: null,
  tasks: [],
  isGenerating: false,
  isLoading: false,
  error: null,

  fetchCurrentWeek: async (date) => {
    set({ isLoading: true, error: null });
    try {
      const { plan, tasks } = await apiPlans.fetchCurrent(date);
      set({ currentPlan: plan, tasks, isLoading: false });
    } catch (e: any) {
      set({
        isLoading: false,
        error: e?.response?.data?.detail || "加载周计划失败，请检查网络连接",
      });
    }
  },

  generatePlanFromIntents: async (intents) => {
    const plan = get().currentPlan;
    if (!plan) return;
    set({ isGenerating: true, error: null });
    try {
      const result = await apiPlans.generate(plan.id, intents);
      set({ tasks: result.tasks, isGenerating: false });
    } catch (e: any) {
      set({
        isGenerating: false,
        error: e?.response?.data?.detail || "AI 生成计划失败，请稍后重试",
      });
    }
  },

  confirmPlan: async () => {
    const plan = get().currentPlan;
    if (!plan) return;
    await apiPlans.update(plan.id, "active");
    set({ currentPlan: { ...plan, status: "active", confirmed_at: new Date().toISOString() } });
  },

  addTask: async (task) => {
    const newTask = await apiTasks.create(task as any);
    set({ tasks: [...get().tasks, newTask] });
  },

  updateTask: async (taskId, updates) => {
    const updated = await apiTasks.update(taskId, updates as any);
    set({
      tasks: get().tasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t)),
    });
  },

  moveTask: async (taskId, toDate, toTime) => {
    // Optimistic update
    set({
      tasks: get().tasks.map((t) =>
        t.id === taskId
          ? { ...t, scheduled_date: toDate, scheduled_time: toTime || t.scheduled_time }
          : t
      ),
    });
    try {
      await apiTasks.update(taskId, {
        scheduled_date: toDate,
        scheduled_time: toTime,
      } as any);
    } catch {
      // Refetch only on failure
      await get().fetchCurrentWeek();
    }
  },

  deleteTask: async (taskId) => {
    await apiTasks.delete(taskId);
    set({ tasks: get().tasks.filter((t) => t.id !== taskId) });
  },

  clearError: () => set({ error: null }),
}));
