// Payments module — typed API surface.
//   Read side (§11.7): summary, transactions list, outstanding by customer,
//     reminders. Hits the existing conddo-api at NEXT_PUBLIC_API_URL — these
//     aggregate over orders + customers and live in the tenant DB.
//   Write side (§7a, RoutePay collections): init checkout + verify on return.
//     Hits the STANDALONE conddo-payments service at NEXT_PUBLIC_PAYMENTS_API_URL.
//     Different deploy, different DB schema (payments.*), shares the JWT
//     (both services trust the same conddo-api issuer + public key).
import { api, ApiError } from "./client";
import type { ApiResponse } from "./types";
import { getAccessToken } from "./auth";

// Base URL for the separate conddo-payments web service. Blank → endpoints
// surface PAYMENTS_NOT_CONFIGURED; UI shows "Payments are being set up".
const PAYMENTS_BASE = process.env.NEXT_PUBLIC_PAYMENTS_API_URL ?? "";

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

// ----- RoutePay checkout (§7a) -----

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "EXPIRED";

export type InitPaymentInput = {
  /** Exactly one of orderId / bookingId; the other is required when amount is omitted. */
  orderId?: string;
  bookingId?: string;
  /** Override / freeform amount in kobo. Optional when an orderId/bookingId is set. */
  amount?: number;
  customerEmail: string;
  customerName: string;
  description?: string;
  /** Where RoutePay sends the customer after checkout. Defaults to the FE's /payments/return. */
  returnUrl?: string;
};

export type InitPaymentResult = {
  reference: string;       // our internal ref (RP-<slug>-<id>)
  paymentUrl: string;      // hosted RoutePay checkout
  status: PaymentStatus;
};

export type VerifyResult = {
  status: PaymentStatus;
  amount: number;          // kobo
  paidAt: string | null;
  failureReason: string | null;
};

/** Translate the request_failed code conddo-api returns when the payments
 *  service isn't yet reachable. Used by PayButton + the return-URL page. */
export const PAYMENTS_NOT_CONFIGURED_CODE = "PAYMENTS_NOT_CONFIGURED";

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

  /** Start a RoutePay checkout for an order, booking, or freeform amount.
   *  Hits the standalone conddo-payments service. */
  initCheckout: (body: InitPaymentInput) =>
    paymentsServiceRequest<InitPaymentResult>("POST", "/api/payments/init", body),

  /** Poll after the customer returns — service may already have the webhook. */
  verify: (reference: string) =>
    paymentsServiceRequest<VerifyResult>("GET", `/api/payments/${encodeURIComponent(reference)}/verify`),
};

// ----- Lightweight client for the standalone conddo-payments service --------
// Reuses our Bearer token (the JWT issued by conddo-api — both services trust
// the same issuer + public key). Same envelope, same error shape. We don't
// share the silent-refresh from client.ts because a 401 here means the same
// token is invalid everywhere — bouncing to /login covers it.

async function paymentsServiceRequest<T>(method: string, path: string, body?: unknown): Promise<{ data: T }> {
  if (!PAYMENTS_BASE) {
    throw new ApiError(
      "PAYMENTS_NOT_CONFIGURED",
      "The payments service URL isn't configured. Talk to the platform team.",
      404,
    );
  }
  const token = getAccessToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  let res: Response;
  try {
    res = await fetch(`${PAYMENTS_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof DOMException && err.name === "AbortError";
    throw new ApiError(
      aborted ? "request_timeout" : "network_error",
      aborted ? "The payments service didn't respond in time." : "Could not reach the payments service.",
    );
  } finally {
    clearTimeout(timer);
  }

  let json: ApiResponse<T> | null = null;
  try { json = (await res.json()) as ApiResponse<T>; } catch { /* non-JSON */ }

  if (!res.ok || !json || json.success === false) {
    throw new ApiError(
      json?.error?.code ?? "request_failed",
      json?.error?.message ?? res.statusText ?? "Payment request failed.",
      res.status,
      json?.error?.details,
    );
  }
  return { data: json.data };
}
