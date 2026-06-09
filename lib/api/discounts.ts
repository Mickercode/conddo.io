// Pharmacy discounts — typed API surface for Spec v2 §12B.
//
// Discounts are created by any staff role but require ADMIN approval before
// they go live. The status machine: PENDING_APPROVAL → APPROVED | REJECTED,
// with EXPIRED set by a scheduled job once `endsAt` passes.
//
// All routes are tenant-scoped via the dashboard-slug pattern from spec v2:
//   /api/v1/dashboard/{slug}/pharmacy/discounts
//
// FE callers pass the slug explicitly (typically `me.tenant.slug`) so the
// surface stays a pure function — easier to test, no hidden tenant lookup.

import { api } from "./client";

export type DiscountType = "PERCENTAGE" | "FIXED";

export type DiscountStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

/** Lightweight product summary attached to discount rows so the list view
 *  doesn't have to join client-side. Matches the spec v2 §12B response. */
export type DiscountProduct = {
  id: string;
  nameGeneric?: string | null;
  nameBrand?: string | null;
  /** v1-compatible display name — pharmacy v2 splits this into brand+generic,
   *  but BE may still emit a plain `name` for non-pharmacy or transitional rows. */
  name?: string | null;
  price: number;
};

export type DiscountActor = { id?: string; name?: string | null } | null;

export type Discount = {
  id: string;
  product: DiscountProduct;
  discountType: DiscountType;
  discountValue: number;
  /** Server-computed: `product.price` minus the discount. */
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

const path = (slug: string, rest: string = "") =>
  `/dashboard/${encodeURIComponent(slug)}/pharmacy/discounts${rest}`;

export const discountsApi = {
  list: (slug: string, p: DiscountListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.status) qs.set("status", p.status);
    if (p.productId) qs.set("productId", p.productId);
    if (p.page != null) qs.set("page", String(p.page));
    if (p.limit != null) qs.set("limit", String(p.limit));
    const tail = qs.toString();
    return api.get<Discount[]>(`${path(slug)}${tail ? `?${tail}` : ""}`);
  },
  create: (slug: string, body: CreateDiscountInput) =>
    api.post<Discount>(path(slug), body),
  approve: (slug: string, id: string, body: ApproveDiscountInput) =>
    api.patch<Discount>(path(slug, `/${id}/approve`), body),
  remove: (slug: string, id: string) =>
    api.del<void>(path(slug, `/${id}`)),
};

/** Naira display for a discount row. Honours the discountedPrice when the BE
 *  has computed it, otherwise derives it client-side. */
export function effectivePrice(d: Discount): number {
  if (typeof d.discountedPrice === "number") return d.discountedPrice;
  if (d.discountType === "PERCENTAGE") {
    return Math.max(0, d.product.price * (1 - d.discountValue / 100));
  }
  return Math.max(0, d.product.price - d.discountValue);
}

/** "20% OFF" / "₦500 OFF" style chip label. */
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
