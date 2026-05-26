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

// Setup checklist (§11.1): onboarding steps + a completed/total tally.
export type ChecklistStep = { key: string; label: string; done: boolean };
export type Checklist = { steps: ChecklistStep[]; completed: number; total: number };

export const dashboardApi = {
  summary: () => api.get<Summary>("/dashboard/summary"),
  setupChecklist: () => api.get<Checklist>("/dashboard/setup-checklist"),
};
