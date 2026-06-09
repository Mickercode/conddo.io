// Pharmacy reminders — typed API surface for Spec v2 §12D.
//
// SMS reminders sent via Brevo. The pharmacist configures one per customer
// (optionally tied to a product), with template variables interpolated
// server-side before the SMS goes out.
//
// Routes are tenant-scoped via the dashboard-slug pattern from spec v2:
//   /api/v1/dashboard/{slug}/pharmacy/reminders

import { api } from "./client";

export type ReminderType = "REFILL_DUE" | "DRUG_USAGE" | "FOLLOW_UP" | "CUSTOM";

export type ReminderRecurrence = "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY";

export type ReminderStatus = "SCHEDULED" | "SENT" | "FAILED" | "CANCELLED";

export type ReminderProduct = {
  id: string;
  /** v2 brand+generic when available; v1 plain `name` otherwise. */
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
  /** Pre-interpolated message (template variables intact). */
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

const path = (slug: string, rest: string = "") =>
  `/dashboard/${encodeURIComponent(slug)}/pharmacy/reminders${rest}`;

export const remindersApi = {
  list: (slug: string, p: ReminderListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.customerId) qs.set("customerId", p.customerId);
    if (p.reminderType) qs.set("reminderType", p.reminderType);
    if (p.status) qs.set("status", p.status);
    if (p.page != null) qs.set("page", String(p.page));
    if (p.limit != null) qs.set("limit", String(p.limit));
    const tail = qs.toString();
    return api.get<Reminder[]>(`${path(slug)}${tail ? `?${tail}` : ""}`);
  },
  create: (slug: string, body: CreateReminderInput) =>
    api.post<Reminder>(path(slug), body),
  cancel: (slug: string, id: string) =>
    api.patch<Reminder>(path(slug, `/${id}/cancel`)),
};

/** Reminder-type display labels. */
export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  REFILL_DUE: "Refill due",
  DRUG_USAGE: "Drug usage",
  FOLLOW_UP: "Follow-up",
  CUSTOM: "Custom",
};

/** Display name for the product attached to a reminder, when present. */
export function reminderProductName(p?: ReminderProduct | null): string | null {
  if (!p) return null;
  if (p.nameBrand && p.nameGeneric) return `${p.nameBrand} (${p.nameGeneric})`;
  return p.nameBrand || p.nameGeneric || p.name || null;
}

/** Interpolate the template variables BE will swap server-side so the FE
 *  can show a faithful preview. Unknown variables are left intact. */
export function previewReminderMessage(
  template: string,
  ctx: { firstName?: string; productName?: string | null; storeName?: string; websiteUrl?: string },
): string {
  return template.replace(/\{(\w+)\}/g, (raw, key) => {
    const v = (ctx as Record<string, string | null | undefined>)[key];
    return v ? String(v) : raw;
  });
}
