// Payments module — typed API surface. Endpoints: ACTION_LIST §11.7.
// Read-only aggregation over orders/payments; invoices/Paystack land later (Billing §7).
import { api } from "./client";

export type PaymentsSummary = {
  thisMonth: number;
  outstanding: number;
  paidInvoices: number;
  overdue: number;
};

// status ∈ received | outstanding | overdue
export type TxnStatus = "received" | "outstanding" | "overdue";
export type Transaction = {
  date: string; // ISO
  customer: string;
  description: string;
  amount: number;
  method: string | null;
  status: TxnStatus;
};

export type OutstandingGroup = {
  customerId: string;
  name: string;
  note: string;
  amount: number;
  tone: string;
};

export type TxnParams = { filter?: string; from?: string; to?: string; page?: number; size?: number };

export const paymentsApi = {
  summary: (range = "") => api.get<PaymentsSummary>(`/payments/summary${range ? `?range=${range}` : ""}`),
  transactions: (p: TxnParams = {}) => {
    const qs = new URLSearchParams();
    if (p.filter) qs.set("filter", p.filter);
    if (p.from) qs.set("from", p.from);
    if (p.to) qs.set("to", p.to);
    qs.set("page", String(p.page ?? 0));
    qs.set("size", String(p.size ?? 20));
    return api.get<Transaction[]>(`/payments/transactions?${qs.toString()}`);
  },
  outstanding: () => api.get<OutstandingGroup[]>("/payments/outstanding"),
  remind: (customerId: string, message?: string) =>
    api.post<{ sent: boolean }>("/payments/reminders", message ? { customerId, message } : { customerId }),
};
