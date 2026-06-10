// Pharmacy refill offers — typed API surface for Spec v2 §12E.
//
// Time-bound discounted pricing offered to returning customers. Create the
// offer once per product, then ISSUE it to specific customers after dispense.
// BE generates a short collision-resistant code (REFILL-XXXX) and optionally
// fires an SMS.
//
// BE shipped paths:
//   GET  /api/v1/pharmacy/refill-offers          (PharmacyRefillOfferController)
//   POST /api/v1/pharmacy/refill-offers
//   POST /api/v1/pharmacy/refill-offers/{id}/issue
//   GET  /api/v1/public/{slug}/pharmacy/refill-offer/{offerCode}  ← customer-facing,
//        (PublicRefillOfferController) takes slug + X-Conddo-Site-Key header

import { api } from "./client";

export type RefillDiscountType = "PERCENTAGE" | "FIXED";

export type RefillProduct = {
  id: string;
  nameGeneric?: string | null;
  nameBrand?: string | null;
  name?: string | null;
  price: number;
};

export type RefillOffer = {
  id: string;
  product: RefillProduct;
  discountType: RefillDiscountType;
  discountValue: number;
  validDays: number;
  maxUses: number;
  message?: string | null;
  isActive: boolean;
  createdBy?: { id?: string; name?: string | null } | null;
  createdAt?: string;
};

export type CreateRefillOfferInput = {
  productId: string;
  discountType: RefillDiscountType;
  discountValue: number;
  validDays: number;
  maxUses?: number;
  message?: string;
};

export type IssueRefillOfferInput = {
  customerId: string;
  sendSms?: boolean;
};

export type RefillOfferClaim = {
  id: string;
  offerCode: string;
  expiresAt: string;
  usedAt?: string | null;
  orderId?: string | null;
};

const BASE = "/pharmacy/refill-offers";

export const refillOffersApi = {
  list: () => api.get<RefillOffer[]>(BASE),
  create: (body: CreateRefillOfferInput) =>
    api.post<RefillOffer>(BASE, body),
  issue: (offerId: string, body: IssueRefillOfferInput) =>
    api.post<RefillOfferClaim>(`${BASE}/${offerId}/issue`, body),

  /** Public validation — the customer-facing checkout calls this with the
   *  tenant's site key. Kept in the same module so the type surface is
   *  shared, even though only the tenant website (not conddo-app) calls it. */
  validate: (slug: string, code: string) =>
    api.get<{
      valid: boolean;
      reason?: string;
      offer?: {
        productId: string;
        discountType: RefillDiscountType;
        discountValue: number;
        expiresAt: string;
      };
    }>(`/public/${encodeURIComponent(slug)}/pharmacy/refill-offer/${encodeURIComponent(code)}`),
};

export function refillProductName(p: RefillProduct): string {
  if (p.nameBrand && p.nameGeneric) return `${p.nameBrand} (${p.nameGeneric})`;
  return p.nameBrand || p.nameGeneric || p.name || "Untitled product";
}

export function summariseOffer(o: RefillOffer): string {
  const amount = o.discountType === "PERCENTAGE"
    ? `${o.discountValue}% off`
    : `₦${o.discountValue.toLocaleString("en-NG")} off`;
  return `${amount} · valid ${o.validDays} day${o.validDays === 1 ? "" : "s"} after dispense`;
}
