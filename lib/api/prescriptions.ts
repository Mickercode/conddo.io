// Prescriptions module — typed API surface for the pharmacy vertical.
// Backend spec lives in backend/specs/PHARMACY_DEEP_DIVE_SPEC.md.
//
// A Prescription is a single medication record tied to a customer. If
// `refillIntervalDays` is set it's a repeat prescription and the server
// computes `nextRefillDue` from `lastFilledAt + refillIntervalDays`; if
// null the script is one-off.

import { api } from "./client";

export type Prescription = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  medication: string;           // e.g. "Lisinopril 10mg"
  dosage?: string | null;       // e.g. "1 tablet daily"
  quantity?: number | null;     // total dispensed, in units (tablets/ml/etc)
  notes?: string | null;
  issuedAt: string;             // ISO datetime
  lastFilledAt?: string | null; // null if never filled
  refillIntervalDays?: number | null; // null → one-off, no refills expected
  nextRefillDue?: string | null;      // ISO date; server-derived
};

export type PrescriptionSummary = {
  total: number;
  dueSoon: number;     // refill due within the next 3 days
  overdue: number;     // nextRefillDue is in the past
  oneOff: number;      // refillIntervalDays is null
};

// FE-derived presentation status. Keep the rules in one place so the list,
// detail, and dashboard widgets agree on the colouring.
export type RefillStatus = "no_refill" | "current" | "due_soon" | "overdue";

export function refillStatusOf(p: Prescription, now: Date = new Date()): RefillStatus {
  if (!p.refillIntervalDays) return "no_refill";
  if (!p.nextRefillDue) return "current"; // active repeat, not yet due
  const due = new Date(p.nextRefillDue);
  if (Number.isNaN(due.getTime())) return "current";
  const diffMs = due.getTime() - now.getTime();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  if (diffMs < 0) return "overdue";
  if (diffMs <= threeDaysMs) return "due_soon";
  return "current";
}

// Write payloads — match backend CreatePrescriptionRequest in §11.13.
export type CreatePrescriptionInput = {
  customerId?: string;
  customerName?: string;
  medication: string;
  dosage?: string;
  quantity?: number;
  refillIntervalDays?: number | null;
  notes?: string;
};
export type UpdatePrescriptionInput = Partial<CreatePrescriptionInput>;

export type PrescriptionListParams = {
  search?: string;
  status?: "active" | "due_soon" | "overdue" | "one_off"; // server-side filter
  customerId?: string;
  page?: number;
  size?: number;
};

export const prescriptionsApi = {
  list: (p: PrescriptionListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.search) qs.set("search", p.search);
    if (p.status) qs.set("status", p.status);
    if (p.customerId) qs.set("customerId", p.customerId);
    qs.set("page", String(p.page ?? 0));
    qs.set("size", String(p.size ?? 50));
    return api.get<Prescription[]>(`/prescriptions?${qs.toString()}`);
  },
  get: (id: string) => api.get<Prescription>(`/prescriptions/${id}`),
  summary: () => api.get<PrescriptionSummary>("/prescriptions/summary"),

  create: (body: CreatePrescriptionInput) => api.post<Prescription>("/prescriptions", body),
  update: (id: string, body: UpdatePrescriptionInput) =>
    api.patch<Prescription>(`/prescriptions/${id}`, body),
  remove: (id: string) => api.del<void>(`/prescriptions/${id}`),

  // Mark a prescription as filled today. Server stamps lastFilledAt = now and
  // recomputes nextRefillDue.
  fill: (id: string) => api.post<Prescription>(`/prescriptions/${id}/fill`),

  // Send an SMS refill reminder to the customer on file (reuses the same
  // SmsSender as OrderService.remind). Backend logs delivery so we don't
  // double-send on the same day.
  remind: (id: string, message?: string) =>
    api.post<void>(`/prescriptions/${id}/remind`, message ? { message } : undefined),
};
