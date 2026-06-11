// POS Phase 1 — typed API surface.
//
// Spec: backend/FE_HANDOFF_POS_PHASE1.md. All endpoints under /api/v1/pos,
// gated by the `pos` feature flag (FeatureFlagGuard returns the canonical
// FEATURE_NOT_ENABLED envelope when not granted). Tenant from JWT.
//
// Money is plain NGN as BigDecimal on the wire — JSON numbers like 1500.00,
// not kobo. No conversion in this module.

import { api } from "./client";

// ---------- Session lifecycle -----------------------------------------------

export type PosSessionStatus = "OPEN" | "CLOSED";

export type PosSessionSummary = {
  /** Number of completed sales this shift (voided sales not counted). */
  salesCount: number;
  totalSales: number;
  totalCash: number;
  totalTransfer: number;
};

export type PosSession = {
  id: string;
  cashierId: string;
  /** Server-joined for the header strip. */
  cashierName?: string | null;
  status: PosSessionStatus;
  openingFloat: number;
  openedAt: string;
  closedAt?: string | null;
  /** Present only after close. */
  expectedCash?: number | null;
  countedCash?: number | null;
  cashVariance?: number | null;
  notes?: string | null;
  summary?: PosSessionSummary;
};

export type OpenSessionInput = {
  openingFloat: number;
  notes?: string;
};

export type CloseSessionInput = {
  countedCash: number;
  notes?: string;
};

// ---------- Sales -----------------------------------------------------------

export type PosSaleStatus = "OPEN" | "COMPLETED" | "VOIDED";

export type PosPaymentMethod = "CASH" | "TRANSFER";

export type PosSaleCustomer = {
  id: string;
  name?: string | null;
  phone?: string | null;
};

export type PosSaleItem = {
  id: string;
  productId: string;
  productName: string;
  sku?: string | null;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type PosPayment = {
  id: string;
  method: PosPaymentMethod;
  amount: number;
  reference?: string | null;
  paidAt: string;
};

export type PosReceipt = {
  saleNumber: string;
  tenant: { name: string; address?: string | null; phone?: string | null };
  lines: PosSaleItem[];
  subtotal: number;
  total: number;
  payments: PosPayment[];
  change: number;
  loyaltyEarned?: number | null;
  cashierName?: string | null;
  completedAt: string;
};

export type PosSale = {
  id: string;
  saleNumber: string;
  sessionId: string;
  cashierId: string;
  customer?: PosSaleCustomer | null;
  status: PosSaleStatus;
  items: PosSaleItem[];
  payments: PosPayment[];
  subtotal: number;
  total: number;
  paid: number;
  /** Positive = outstanding; negative = change due to customer. */
  balance: number;
  openedAt: string;
  completedAt?: string | null;
  voidedAt?: string | null;
  /** Present on COMPLETED sales — what FE renders to thermal/PDF/print. */
  receipt?: PosReceipt;
};

export type CreateSaleInput = {
  customerId?: string;
};

/** Add a line by product id (from picker) OR by barcode (from scanner). Both
 *  go through the same endpoint per FE↔BE agreement — the request body has a
 *  discriminated `productId | barcode` field. */
export type AddSaleItemInput =
  | { productId: string; qty?: number }
  | { barcode: string; qty?: number };

export type UpdateSaleItemInput = {
  qty: number;
};

export type AddPaymentInput = {
  method: PosPaymentMethod;
  amount: number;
  /** Optional for CASH; required for TRANSFER. */
  reference?: string;
};

export type AttachCustomerInput = {
  customerId: string;
};

// ---------- Product picker --------------------------------------------------

export type PosProductHit = {
  productId: string;
  name: string;
  sku?: string | null;
  /** Barcode if known — useful when the picker doubles as a "confirm scan" UI. */
  barcode?: string | null;
  price: number;
  stock: number;
  /** Convenience flag — `stock <= reorderLevel` server-side. */
  lowStock: boolean;
};

// ---------- API surface -----------------------------------------------------

export const posApi = {
  // Sessions
  openSession: (body: OpenSessionInput) =>
    api.post<PosSession>("/pos/sessions", body),
  currentSession: () => api.get<PosSession | null>("/pos/sessions/current"),
  getSession: (id: string) => api.get<PosSession>(`/pos/sessions/${id}`),
  closeSession: (id: string, body: CloseSessionInput) =>
    api.post<PosSession>(`/pos/sessions/${id}/close`, body),

  // Sales
  createSale: (body: CreateSaleInput = {}) =>
    api.post<PosSale>("/pos/sales", body),
  getSale: (id: string) => api.get<PosSale>(`/pos/sales/${id}`),
  addItem: (id: string, body: AddSaleItemInput) =>
    api.post<PosSale>(`/pos/sales/${id}/items`, body),
  updateItem: (id: string, itemId: string, body: UpdateSaleItemInput) =>
    api.patch<PosSale>(`/pos/sales/${id}/items/${itemId}`, body),
  removeItem: (id: string, itemId: string) =>
    api.del<PosSale>(`/pos/sales/${id}/items/${itemId}`),
  addPayment: (id: string, body: AddPaymentInput) =>
    api.post<PosSale>(`/pos/sales/${id}/payments`, body),
  removePayment: (id: string, paymentId: string) =>
    api.del<PosSale>(`/pos/sales/${id}/payments/${paymentId}`),
  attachCustomer: (id: string, body: AttachCustomerInput) =>
    api.post<PosSale>(`/pos/sales/${id}/attach-customer`, body),
  completeSale: (id: string) => api.post<PosSale>(`/pos/sales/${id}/complete`),
  voidSale: (id: string) => api.post<PosSale>(`/pos/sales/${id}/void`),

  // Picker
  searchProducts: (q: string, limit = 20) =>
    api.get<PosProductHit[]>(
      `/pos/products/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    ),
};
