// Brand Packages — monthly creative bundles (Phase 3 of the social /
// creative-services epic). Tenants subscribe to a tier; the BE deducts
// from the included quota as creative_service_requests come in instead
// of charging per-job.
//
// BE spec: backend/SOCIAL_AND_CREATIVE_SERVICES_SPEC.md §6.
// Shipped: backend commit 439a336 (feat(brand-packages): Phase 3).

import { api } from "./client";
import type { OfferingCode } from "./creative";

export type BrandPackageOffering = {
  code: string;                         // "starter_brand" | "growth_brand" | "pro_brand" | …
  name: string;
  description: string;
  monthlyPriceKobo: number;
  /** Per-offering-code quota for the month. Keys are creative
   *  OfferingCode values (design_static, design_reels, ad_creative_*). */
  includes: Partial<Record<OfferingCode | string, number>>;
};

export type SubscriptionStatus = "active" | "past_due" | "cancelled";

export type BrandPackageSubscription = {
  id: string;
  offeringCode: string;
  status: SubscriptionStatus;
  currentPeriodStart: string;          // ISO datetime
  currentPeriodEnd: string;
  cancelledAt: string | null;
};

/** GET /brand-packages/subscription — the tenant's current subscription
 *  with the joined offering. Both nullable for unsubscribed tenants. */
export type CurrentSubscriptionResult = {
  subscription: BrandPackageSubscription | null;
  offering: BrandPackageOffering | null;
};

/** GET /brand-packages/usage — counts consumed against this period's quota.
 *  Keys mirror `offering.includes` so the FE can compare 1:1.
 *  Returns null for unsubscribed tenants — guarded by QueryBoundary. */
export type BrandPackageUsage = {
  periodStart: string;
  periodEnd: string;
  counts: Partial<Record<OfferingCode | string, number>>;
};

/** POST /brand-packages/subscription — initial charge. Returns a
 *  RoutePay-hosted checkout URL the FE redirects to; BE flips status
 *  to 'active' once the payment webhook fires. */
export type SubscribeResult = {
  subscription: BrandPackageSubscription;
  checkoutUrl: string | null;          // null if the BE skips checkout (e.g. trial)
};

export const brandPackagesApi = {
  offerings: () => api.get<BrandPackageOffering[]>("/brand-packages/offerings"),
  current:   () => api.get<CurrentSubscriptionResult>("/brand-packages/subscription"),
  usage:     () => api.get<BrandPackageUsage>("/brand-packages/usage"),
  subscribe: (offeringCode: string) =>
    api.post<SubscribeResult>("/brand-packages/subscription", { offeringCode }),
  cancel:    () => api.post<BrandPackageSubscription>("/brand-packages/subscription/cancel"),
};
