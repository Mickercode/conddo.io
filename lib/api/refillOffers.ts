// Pharmacy refill offers — typed API surface for Spec v2 §12E.
//
// Time-bound discounted pricing offered to returning customers. A pharmacist
// creates the offer once (per product, with discount + valid-days window),
// then ISSUES it to specific customers after dispense — the BE generates a
// short collision-resistant code (REFILL-XXXX) and optionally fires an SMS.
// At checkout the public website validates the code via the public route.
//
// Tenant-scoped via the dashboard-slug pattern from spec v2:
//   /api/v1/dashboard/{slug}/pharmacy/refill-offers
//   /api/v1/public/{slug}/pharmacy/refill-offer/{offerCode}  (customer-facing)

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
  /** SMS template sent when the offer is ISSUED to a customer. */
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

const dashPath = (slug: string, rest: string = "") =>
  `/dashboard/${encodeURIComponent(slug)}/pharmacy/refill-offers${rest}`;

const publicPath = (slug: string, code: string) =>
  `/public/${encodeURIComponent(slug)}/pharmacy/refill-offer/${encodeURIComponent(code)}`;

export const refillOffersApi = {
  list: (slug: string) => api.get<RefillOffer[]>(dashPath(slug)),
  create: (slug: string, body: CreateRefillOfferInput) =>
    api.post<RefillOffer>(dashPath(slug), body),
  issue: (slug: string, offerId: string, body: IssueRefillOfferInput) =>
    api.post<RefillOfferClaim>(dashPath(slug, `/${offerId}/issue`), body),

  /** Public validation — used at the customer-facing checkout. Returns
   *  `{ valid: true, offer: {...} }` or `{ valid: false, reason: "..." }`. */
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
    }>(publicPath(slug, code)),
};

export function refillProductName(p: RefillProduct): string {
  if (p.nameBrand && p.nameGeneric) return `${p.nameBrand} (${p.nameGeneric})`;
  return p.nameBrand || p.nameGeneric || p.name || "Untitled product";
}

/** "10% off" / "₦500 off, 30-day window" style summary. */
export function summariseOffer(o: RefillOffer): string {
  const amount = o.discountType === "PERCENTAGE"
    ? `${o.discountValue}% off`
    : `₦${o.discountValue.toLocaleString("en-NG")} off`;
  return `${amount} · valid ${o.validDays} day${o.validDays === 1 ? "" : "s"} after dispense`;
}
