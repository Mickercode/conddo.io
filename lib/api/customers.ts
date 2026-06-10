// Customers module — typed API surface (write once, reuse anywhere).
// Endpoints: ACTION_LIST §11.3. Consumed by the Customers list, profile, search, etc.
import { api } from "./client";
import type { Order } from "./orders";

// GET /customers/{id}/payments — a payment across the customer's orders.
export type CustomerPayment = { id: string; amount: number; method: string | null; note: string | null; paidAt: string };

export type CustomerTag = "VIP" | "New" | "Lead" | null;

export type Customer = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  totalSpent: number;
  orders: number;
  lastActive: string;
  tag: CustomerTag;
};

export const tagTone: Record<NonNullable<CustomerTag>, "primary" | "success" | "neutral"> = {
  VIP: "primary",
  New: "success",
  Lead: "neutral",
};

export type CustomerListParams = { search?: string; filter?: string; page?: number; size?: number };

/** BE-defined customer segment for the list-page filter chips. The `key` is
 *  the value the FE passes back as the `filter` query param (so e.g.
 *  `?filter=high_value` lists the high-value customers). */
export type CustomerSegment = { key: string; label: string; count: number };

// GET /customers/{id} — richer than the list row.
export type CustomerDetail = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  tag: CustomerTag;
  tags: string[];
  memberSince: string | null;
  totalSpent: number;
  orders: number;
  avgOrderValue: number;
  lastActive: string | null;
  notes: string | null;
  measurements: Record<string, string | number> | null;
};

// Write payloads (backend CreateCustomerRequest / UpdateCustomerRequest, §11.3).
export type CreateCustomerInput = { fullName: string; email?: string; phone?: string; notes?: string };
export type UpdateCustomerInput = { fullName?: string; email?: string; phone?: string };

export const customersApi = {
  list: (p: CustomerListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.search) qs.set("search", p.search);
    if (p.filter) qs.set("filter", p.filter);
    qs.set("page", String(p.page ?? 0));
    qs.set("size", String(p.size ?? 20));
    return api.get<Customer[]>(`/customers?${qs.toString()}`);
  },
  get: (id: string) => api.get<CustomerDetail>(`/customers/${id}`),
  orders: (id: string) => api.get<Order[]>(`/customers/${id}/orders`),
  payments: (id: string) => api.get<CustomerPayment[]>(`/customers/${id}/payments`),
  create: (body: CreateCustomerInput) => api.post<CustomerDetail>("/customers", body),
  update: (id: string, body: UpdateCustomerInput) => api.patch<CustomerDetail>(`/customers/${id}`, body),
  remove: (id: string) => api.del<void>(`/customers/${id}`),

  /** Server-defined buckets the list page filters by — "all", "new",
   *  "high_value", "inactive" — with live counts. */
  segments: () => api.get<CustomerSegment[]>("/customers/segments"),
  /** Light GET for refreshing notes after a save without re-fetching the
   *  whole customer detail. */
  getNotes: (id: string) => api.get<{ notes: string | null }>(`/customers/${id}/notes`),
  setNotes: (id: string, notes: string) => api.put<{ notes: string | null }>(`/customers/${id}/notes`, { notes }),
  setMeasurements: (id: string, measurements: Record<string, string | number>) =>
    api.put<{ measurements: Record<string, string | number> | null }>(`/customers/${id}/measurements`, { measurements }),
  addTag: (id: string, tag: string) => api.post<CustomerDetail>(`/customers/${id}/tags`, { tag }),
  removeTag: (id: string, tag: string) => api.del<CustomerDetail>(`/customers/${id}/tags?tag=${encodeURIComponent(tag)}`),
};
