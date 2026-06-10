// Pharmacy discounts — typed API surface for Spec v2 §12B.
//
// Discounts are created by any staff role but require ADMIN approval before
// they go live. Status machine: PENDING_APPROVAL → APPROVED | REJECTED, with
// EXPIRED set by a scheduled job once `endsAt` passes.
//
// BE shipped paths (confirmed against PharmacyDiscountController):
//   GET    /api/v1/pharmacy/discounts
//   POST   /api/v1/pharmacy/discounts
//   PATCH  /api/v1/pharmacy/discounts/{id}/approve
//   DELETE /api/v1/pharmacy/discounts/{id}
// Tenant comes from the JWT — no slug in the URL.

import { api } from "./client";

export type DiscountType = "PERCENTAGE" | "FIXED";

export type DiscountStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type DiscountProduct = {
  id: string;
  nameGeneric?: string | null;
  nameBrand?: string | null;
  name?: string | null;
  price: number;
};

export type DiscountActor = { id?: string; name?: string | null } | null;

export type Discount = {
  id: string;
  product: DiscountProduct;
  discountType: DiscountType;
  discountValue: number;
  discountedPrice?: number;
  label?: string | null;
  startsAt: string;
  endsAt?: string | null;
  status: DiscountStatus;
  createdBy?: DiscountActor;
  approvedBy?: DiscountActor;
  approvedAt?: string | null;
  rejectionNote?: string | null;
  createdAt?: string;
};

export type DiscountListParams = {
  status?: DiscountStatus;
  productId?: string;
  page?: number;
  limit?: number;
};

export type CreateDiscountInput = {
  productId: string;
  discountType: DiscountType;
  discountValue: number;
  label?: string;
  startsAt: string;
  endsAt?: string | null;
};

export type ApproveDiscountInput =
  | { action: "APPROVE"; note?: never }
  | { action: "REJECT"; note: string };

const BASE = "/pharmacy/discounts";

export const discountsApi = {
  list: (p: DiscountListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.status) qs.set("status", p.status);
    if (p.productId) qs.set("productId", p.productId);
    if (p.page != null) qs.set("page", String(p.page));
    if (p.limit != null) qs.set("limit", String(p.limit));
    const tail = qs.toString();
    return api.get<Discount[]>(`${BASE}${tail ? `?${tail}` : ""}`);
  },
  create: (body: CreateDiscountInput) =>
    api.post<Discount>(BASE, body),
  approve: (id: string, body: ApproveDiscountInput) =>
    api.patch<Discount>(`${BASE}/${id}/approve`, body),
  remove: (id: string) =>
    api.del<void>(`${BASE}/${id}`),
};

export function effectivePrice(d: Discount): number {
  if (typeof d.discountedPrice === "number") return d.discountedPrice;
  if (d.discountType === "PERCENTAGE") {
    return Math.max(0, d.product.price * (1 - d.discountValue / 100));
  }
  return Math.max(0, d.product.price - d.discountValue);
}

export function discountChipLabel(d: Discount): string {
  if (d.label?.trim()) return d.label.trim();
  return d.discountType === "PERCENTAGE"
    ? `${d.discountValue}% OFF`
    : `₦${d.discountValue.toLocaleString("en-NG")} OFF`;
}

export function productDisplayName(p: DiscountProduct): string {
  if (p.nameBrand && p.nameGeneric) return `${p.nameBrand} (${p.nameGeneric})`;
  return p.nameBrand || p.nameGeneric || p.name || "Untitled product";
}
