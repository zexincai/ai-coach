import client from "./client";
import { WeeklyReport } from "../types/models";

export const apiAnalytics = {
  fetchWeekly: async (weekStart: string): Promise<WeeklyReport> => {
    const { data } = await client.get("/analytics/weekly", {
      params: { week_start: weekStart },
    });
    return data;
  },
};
