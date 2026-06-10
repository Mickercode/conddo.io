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
  /** Hide a single setup step the tenant doesn't intend to do (e.g. they
   *  don't run staff). Returns the updated checklist with the step removed. */
  dismissChecklistStep: (key: string) =>
    api.post<Checklist>(`/dashboard/setup-checklist/${encodeURIComponent(key)}/dismiss`),
};
