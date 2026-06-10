// Pharmacy reminders — typed API surface for Spec v2 §12D.
//
// SMS reminders sent via Brevo. Pharmacist configures one per customer
// (optionally tied to a product), with template variables interpolated
// server-side before each send.
//
// BE shipped paths (confirmed against PharmacyReminderController):
//   GET   /api/v1/pharmacy/reminders
//   POST  /api/v1/pharmacy/reminders
//   PATCH /api/v1/pharmacy/reminders/{id}/cancel
// Tenant from JWT — no slug in the URL.

import { api } from "./client";

export type ReminderType = "REFILL_DUE" | "DRUG_USAGE" | "FOLLOW_UP" | "CUSTOM";

export type ReminderRecurrence = "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";

export type ReminderStatus = "SCHEDULED" | "SENT" | "FAILED" | "CANCELLED";

export type ReminderProduct = {
  id: string;
  nameGeneric?: string | null;
  nameBrand?: string | null;
  name?: string | null;
};

export type ReminderCustomer = {
  id: string;
  name?: string | null;
  phone?: string | null;
};

export type Reminder = {
  id: string;
  customer: ReminderCustomer;
  product?: ReminderProduct | null;
  reminderType: ReminderType;
  message: string;
  scheduledAt: string;
  recurrence?: ReminderRecurrence | null;
  recurrenceEnd?: string | null;
  status: ReminderStatus;
  sentAt?: string | null;
  createdAt?: string;
};

export type ReminderListParams = {
  customerId?: string;
  reminderType?: ReminderType;
  status?: ReminderStatus;
  page?: number;
  limit?: number;
};

export type CreateReminderInput = {
  customerId: string;
  productId?: string;
  reminderType: ReminderType;
  message: string;
  scheduledAt: string;
  recurrence?: ReminderRecurrence;
  recurrenceEnd?: string | null;
};

const BASE = "/pharmacy/reminders";

export const remindersApi = {
  list: (p: ReminderListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.customerId) qs.set("customerId", p.customerId);
    if (p.reminderType) qs.set("reminderType", p.reminderType);
    if (p.status) qs.set("status", p.status);
    if (p.page != null) qs.set("page", String(p.page));
    if (p.limit != null) qs.set("limit", String(p.limit));
    const tail = qs.toString();
    return api.get<Reminder[]>(`${BASE}${tail ? `?${tail}` : ""}`);
  },
  create: (body: CreateReminderInput) =>
    api.post<Reminder>(BASE, body),
  cancel: (id: string) =>
    api.patch<Reminder>(`${BASE}/${id}/cancel`),
};

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  REFILL_DUE: "Refill due",
  DRUG_USAGE: "Drug usage",
  FOLLOW_UP: "Follow-up",
  CUSTOM: "Custom",
};

export function reminderProductName(p?: ReminderProduct | null): string | null {
  if (!p) return null;
  if (p.nameBrand && p.nameGeneric) return `${p.nameBrand} (${p.nameGeneric})`;
  return p.nameBrand || p.nameGeneric || p.name || null;
}

export function previewReminderMessage(
  template: string,
  ctx: { firstName?: string; productName?: string | null; storeName?: string; websiteUrl?: string },
): string {
  return template.replace(/\{(\w+)\}/g, (raw, key) => {
    const v = (ctx as Record<string, string | null | undefined>)[key];
    return v ? String(v) : raw;
  });
}
