// Pharmacy stock movements + reconciliation — Spec v2 §12A.
//
// Despite what the spec doc says about dashboard-slug paths, the BE actually
// shipped these under `/api/v1/inventory/*` (tenant via JWT) — consistent
// with the rest of the inventory surface. Confirmed by reading the live
// PharmacyInventoryController at commit 9a1d5cf.
//
// Endpoints:
//   GET    /inventory/movements          ← audit log
//   POST   /inventory/restock            ← record a delivery (multi-line)
//   POST   /inventory/adjustment         ← manual adjustment with reason
//   POST   /inventory/reconciliations    ← start a session
//   GET    /inventory/reconciliations/{id}
//   PATCH  /inventory/reconciliations/{id}/counts   ← submit physical counts
//   POST   /inventory/reconciliations/{id}/complete ← apply variances

import { api } from "./client";

// ---------- Movements (audit log) -------------------------------------------

export type MovementType =
  | "SALE_ONLINE"
  | "SALE_POS"
  | "RESTOCK"
  | "ADJUSTMENT"
  | "RECONCILIATION"
  | "RETURN"
  | "EXPIRY_REMOVAL"
  | "TRANSFER_OUT"
  | "TRANSFER_IN";

export type StockMovement = {
  id: string;
  productId: string;
  movementType: MovementType | string;
  /** Signed: negative on deductions, positive on additions. */
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  referenceId?: string | null;
  referenceKind?: string | null;
  note?: string | null;
  createdBy?: string | null;
  createdAt: string;
};

export type MovementListParams = {
  productId?: string;
  movementType?: MovementType | string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};

// ---------- Restock ----------------------------------------------------------

export type RestockLine = { productId: string; quantity: number };
export type RestockInput = { items: RestockLine[]; note?: string };
export type RestockResult = {
  restockId?: string | null;
  itemsRestocked: number;
  movements: StockMovement[];
};

// ---------- Adjustment ------------------------------------------------------

/** Reason codes per spec. The FE submits the human label up-front so the
 *  audit trail is readable; BE persists the code verbatim. */
export type AdjustmentReason =
  | "EXPIRY_REMOVAL"
  | "DAMAGE"
  | "THEFT"
  | "COUNT_CORRECTION"
  | "OTHER";

/** IMPORTANT: `adjustedQty` is the **absolute target** (not a delta). BE
 *  computes the variance internally as adjustedQty - currentQty and writes
 *  one ADJUSTMENT row to the movement log. */
export type AdjustmentInput = {
  productId: string;
  adjustedQty: number;
  reason: AdjustmentReason;
  note?: string;
};

export type AdjustmentResult = {
  movement: StockMovement;
  quantityBefore: number;
  quantityAfter: number;
  variance: number;
};

// ---------- Reconciliation --------------------------------------------------

export type ReconciliationStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type ReconciliationItem = {
  productId: string;
  systemQty: number;
  countedQty: number | null;
  variance: number | null;
  resolved: boolean;
};

export type Reconciliation = {
  id: string;
  status: ReconciliationStatus;
  startedAt: string;
  completedAt?: string | null;
  startedBy?: string | null;
  completedBy?: string | null;
  notes?: string | null;
  items: ReconciliationItem[];
};

export type StartReconciliationResult = {
  reconciliationId: string;
  status: ReconciliationStatus;
  totalProducts: number;
  startedAt: string;
};

export type ReconciliationDetailResult = { reconciliation: Reconciliation };

export type SubmitCountsInput = {
  counts: { productId: string; countedQty: number }[];
};

export type CompleteReconciliationResult = {
  completedAt: string;
  summary: {
    totalProducts: number;
    matched: number;
    variance: number;
    totalVarianceUnits: number;
    adjustmentsApplied: number;
  };
};

// ---------- API surface -----------------------------------------------------

export const pharmacyInventoryApi = {
  movements: (p: MovementListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.productId) qs.set("productId", p.productId);
    if (p.movementType) qs.set("movementType", p.movementType);
    if (p.from) qs.set("from", p.from);
    if (p.to) qs.set("to", p.to);
    qs.set("page", String(p.page ?? 0));
    qs.set("size", String(p.size ?? 20));
    return api.get<StockMovement[]>(`/inventory/movements?${qs.toString()}`);
  },

  restock: (body: RestockInput) =>
    api.post<RestockResult>("/inventory/restock", body),

  adjustment: (body: AdjustmentInput) =>
    api.post<AdjustmentResult>("/inventory/adjustment", body),

  startReconciliation: (note?: string) =>
    api.post<StartReconciliationResult>("/inventory/reconciliations", note ? { note } : {}),

  getReconciliation: (id: string) =>
    api.get<ReconciliationDetailResult>(`/inventory/reconciliations/${id}`),

  submitCounts: (id: string, body: SubmitCountsInput) =>
    api.patch<ReconciliationDetailResult>(`/inventory/reconciliations/${id}/counts`, body),

  completeReconciliation: (id: string) =>
    api.post<CompleteReconciliationResult>(`/inventory/reconciliations/${id}/complete`),
};

// ---------- Display helpers -------------------------------------------------

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  SALE_ONLINE:      "Online sale",
  SALE_POS:         "POS sale",
  RESTOCK:          "Restock",
  ADJUSTMENT:       "Adjustment",
  RECONCILIATION:   "Reconciliation",
  RETURN:           "Return",
  EXPIRY_REMOVAL:   "Expiry removal",
  TRANSFER_OUT:     "Transfer out",
  TRANSFER_IN:      "Transfer in",
};

export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  EXPIRY_REMOVAL:   "Expiry removal",
  DAMAGE:           "Damage",
  THEFT:            "Theft",
  COUNT_CORRECTION: "Count correction",
  OTHER:            "Other",
};

export function movementTone(t: string): "success" | "danger" | "warning" | "primary" | "neutral" {
  switch (t) {
    case "RESTOCK":
    case "TRANSFER_IN":
    case "RETURN":
      return "success";
    case "SALE_ONLINE":
    case "SALE_POS":
    case "TRANSFER_OUT":
    case "EXPIRY_REMOVAL":
      return "danger";
    case "ADJUSTMENT":
    case "RECONCILIATION":
      return "warning";
    default:
      return "neutral";
  }
}

/** localStorage key the FE uses to remember the most recent reconciliation
 *  id per tenant, so a user navigating away can resume the in-progress
 *  session. Cleared when a reconciliation completes successfully. */
export const RECONCILIATION_RESUME_KEY = "conddo:pharmacy:lastReconciliationId";
