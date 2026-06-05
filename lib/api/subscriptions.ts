// Subscriptions module — typed API surface for billing tiers.
// Backend spec lives in backend/BILLING_TIERS_SPEC.md.
//
// A tenant has a subscription pointing at a plan. Plans (launcher / growth /
// scaler) are tier identifiers — the BE owns the canonical list via
// /billing/plans and gates module access via feature_key checks.

import { api } from "./client";

export type PlanId = "launcher" | "growth" | "scaler";
export type BillingCycle = "monthly" | "quarterly" | "custom";
export type SubscriptionStatus = "active" | "trialing" | "grace" | "expired" | "cancelled";

// Feature keys gate specific modules / actions. Keep this in sync with the
// plan_features table in the spec — the BE returns the boolean / numeric
// value the FE checks against.
export type FeatureKey =
  | "website"
  | "custom_domain"
  | "business_email"
  | "order_management"
  | "bookings"
  | "email_campaigns"
  | "sms_campaigns"
  | "social_scheduler"
  | "ad_management"
  | "multi_location"
  | "api_access"
  | "advanced_analytics"
  | "staff_accounts";

export type Plan = {
  id: PlanId;
  displayName: string;             // "Launcher" / "Growth" / "Scaler"
  monthlyPrice: number | null;     // ₦; null for Scaler (custom)
  quarterlyPrice: number | null;   // ₦; null for Scaler (custom)
  isCustom: boolean;               // true for Scaler
  // Feature map — true/false for boolean gates, string for numeric limits
  // ("2", "5", "unlimited"). FE coerces.
  features: Partial<Record<FeatureKey, string>>;
};

export type Subscription = {
  planId: PlanId;
  planDisplayName: string;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  amountPaid: number;          // ₦ (last paid, 0 during trial)
  startedAt: string;            // ISO
  expiresAt: string;            // ISO — when current period ends
  cancelledAt?: string | null;  // ISO if cancelled
  trialEndsAt?: string | null;  // ISO during trial; null after
  daysRemaining: number;        // server-computed convenience
};

// Returns the gate value for a feature on the tenant's current plan. Coerces
// "true"/"false" → boolean; numeric strings → number; "unlimited" → Infinity.
export function featureValue(plan: Plan | null, key: FeatureKey): boolean | number {
  if (!plan) return false;
  const raw = plan.features[key];
  if (raw == null) return false;
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (raw === "unlimited") return Number.POSITIVE_INFINITY;
  const n = Number(raw);
  return Number.isFinite(n) ? n : Boolean(raw);
}

export function hasFeature(plan: Plan | null, key: FeatureKey): boolean {
  const v = featureValue(plan, key);
  return v === true || (typeof v === "number" && v > 0);
}

export type UpgradeInput = { planId: PlanId; billingCycle: BillingCycle };

export const subscriptionsApi = {
  // List all plans (catalog). Public — also used by the marketing pricing page
  // when we want server-driven pricing.
  plans: () => api.get<Plan[]>("/billing/plans"),
  // Current tenant's subscription.
  current: () => api.get<Subscription>("/billing/subscription"),
  // Switch plan / cycle. Server prorates the difference.
  upgrade: (body: UpgradeInput) => api.post<Subscription>("/billing/upgrade", body),
  // Cancel — takes effect at period end (cancelledAt set, status stays active
  // until expiresAt then flips to cancelled).
  cancel: () => api.post<Subscription>("/billing/cancel"),
};
