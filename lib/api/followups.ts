// Pharmacy Follow-up Workflow — Roadmap Beta 2.
//
// Lets a pharmacist schedule a clinical follow-up after dispensing — Conddo
// reminds them when it's due, then they record the outcome on the patient's
// record. Separates a pharmacy from a drug shop: clinical follow-up is
// pharmaceutical care.
//
// Expected BE paths (per roadmap doc + the BE-wide normalisation to
// /api/v1/pharmacy/{module}):
//   GET    /api/v1/pharmacy/followups
//   POST   /api/v1/pharmacy/followups
//   PATCH  /api/v1/pharmacy/followups/{id}/complete
//   PATCH  /api/v1/pharmacy/followups/{id}/cancel
//   GET    /api/v1/pharmacy/followups/due-today
//
// Tenant from JWT — no slug in URL.

import { api } from "./client";

export type FollowupStatus = "PENDING" | "COMPLETED" | "MISSED" | "CANCELLED";

export type FollowupOutcomeType =
  | "RECOVERED"
  | "REFERRED"
  | "SIDE_EFFECT"
  | "NO_RESPONSE"
  | "OTHER";

export type FollowupActor = { id?: string; name?: string | null } | null;

export type FollowupCustomer = {
  id: string;
  name?: string | null;
  phone?: string | null;
};

export type FollowupProduct = {
  id: string;
  nameGeneric?: string | null;
  nameBrand?: string | null;
  name?: string | null;
};

export type Followup = {
  id: string;
  customer: FollowupCustomer;
  product?: FollowupProduct | null;
  orderId?: string | null;
  dueDate: string;
  /** What to check on the follow-up (e.g. "Did the infection clear?"). */
  checkNote: string;
  status: FollowupStatus;
  outcome?: string | null;
  outcomeType?: FollowupOutcomeType | null;
  completedBy?: FollowupActor;
  completedAt?: string | null;
  createdBy?: FollowupActor;
  createdAt: string;
};

export type FollowupListParams = {
  status?: FollowupStatus;
  customerId?: string;
  page?: number;
  limit?: number;
};

export type CreateFollowupInput = {
  customerId: string;
  productId?: string;
  orderId?: string;
  dueDate: string;        // ISO timestamp
  checkNote: string;
};

export type CompleteFollowupInput = {
  outcome: string;
  outcomeType: FollowupOutcomeType;
};

const BASE = "/pharmacy/followups";

export const followupsApi = {
  list: (p: FollowupListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.status) qs.set("status", p.status);
    if (p.customerId) qs.set("customerId", p.customerId);
    if (p.page != null) qs.set("page", String(p.page));
    if (p.limit != null) qs.set("limit", String(p.limit));
    const tail = qs.toString();
    return api.get<Followup[]>(`${BASE}${tail ? `?${tail}` : ""}`);
  },
  /** Follow-ups due in the next 24h — drives the dashboard widget per spec. */
  dueToday: () => api.get<Followup[]>(`${BASE}/due-today`),
  create: (body: CreateFollowupInput) => api.post<Followup>(BASE, body),
  complete: (id: string, body: CompleteFollowupInput) =>
    api.patch<Followup>(`${BASE}/${id}/complete`, body),
  cancel: (id: string) => api.patch<Followup>(`${BASE}/${id}/cancel`),
};

export const FOLLOWUP_STATUS_LABELS: Record<FollowupStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  MISSED: "Missed",
  CANCELLED: "Cancelled",
};

export const FOLLOWUP_OUTCOME_LABELS: Record<FollowupOutcomeType, string> = {
  RECOVERED: "Recovered well",
  REFERRED: "Referred to doctor",
  SIDE_EFFECT: "Side effect — switched medication",
  NO_RESPONSE: "No response from patient",
  OTHER: "Other",
};

export function followupProductName(p?: FollowupProduct | null): string | null {
  if (!p) return null;
  if (p.nameBrand && p.nameGeneric) return `${p.nameBrand} (${p.nameGeneric})`;
  return p.nameBrand || p.nameGeneric || p.name || null;
}
