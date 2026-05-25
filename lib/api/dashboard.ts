// Dashboard module — typed API surface. Endpoint: ACTION_LIST §11.1.
import { api } from "./client";

export type Tone = "success" | "warning" | "danger" | "neutral";
export type StatValue = { value: number; delta: string; tone: Tone };
export type Summary = {
  revenueToday: StatValue;
  pendingOrders: StatValue;
  newCustomers: StatValue;
  lowStockItems: StatValue;
};

export const dashboardApi = {
  summary: () => api.get<Summary>("/dashboard/summary"),
};
