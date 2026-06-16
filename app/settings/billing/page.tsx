"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarClock, CheckCircle2, Sparkles, Info } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { naira } from "@/lib/format";
import {
  subscriptionsApi,
  type BillingCycle,
  type PlanId,
  type SubscriptionStatus,
} from "@/lib/api/subscriptions";
import { meQuery } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import { openPaystackInline, paystackInlineAvailable } from "@/lib/paystack-inline";

// Catalog mirrors the marketing pricing page. Source of truth at run time is
// /billing/plans (BE), but the static copy here lets the page render fully
// before the BE ships — and never lies about prices that aren't already in
// the spec.
const PLAN_CATALOG: {
  id: PlanId;
  name: string;
  blurb: string;
  monthly: number | null;
  quarterly: number | null;
}[] = [
  { id: "launcher", name: "Launcher", blurb: "Going digital for the first time.", monthly: 20_000, quarterly: 54_000 },
  { id: "growth", name: "Growth", blurb: "Actively selling every day.", monthly: 45_000, quarterly: 120_000 },
  { id: "scaler", name: "Scaler", blurb: "Multi-location, teams, custom needs.", monthly: 120_000, quarterly: null },
];

const statusChip: Record<SubscriptionStatus, { tone: "success" | "warning" | "danger" | "neutral"; label: string }> = {
  active: { tone: "success", label: "Active" },
  trialing: { tone: "warning", label: "Trial" },
  grace: { tone: "warning", label: "Grace period" },
  expired: { tone: "danger", label: "Expired" },
  cancelled: { tone: "neutral", label: "Cancelled" },
};

function fmtDate(s?: string | null): string {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" });
}

export default function BillingSettings() {
  const toast = useToast();
  const sub = useApiQuery(subscriptionsApi.current);
  const meQ = useApiQuery(meQuery);
  const [upgrading, setUpgrading] = useState<PlanId | null>(null);

  const data = sub.data;
  // BE may return 404 / a "no active subscription" error for tenants who
  // existed before billing rolled out. Treat that as "no current plan" —
  // the plan picker still works as the path forward. Only show a real
  // error state when the request fails for a different reason (network /
  // 5xx without a recognisable shape).
  const subError = sub.error;
  const isMissingSubscription = subError instanceof ApiError && (
    subError.status === 404 ||
    /no active subscription/i.test(subError.message)
  );
  const isHardError = subError && !isMissingSubscription;

  const currentPlan = data?.planId ?? null;
  const cycle = data?.billingCycle ?? "monthly";

  async function selectPlan(targetId: PlanId) {
    if (targetId === "scaler") {
      // Scaler is sales-led, not self-serve — open consultation email.
      window.location.href = "mailto:hello@conddo.io?subject=Scaler%20upgrade";
      return;
    }
    if (targetId === currentPlan) return;
    setUpgrading(targetId);

    let checkout: { authorizationUrl: string; reference: string; accessCode?: string };
    try {
      const { data } = await subscriptionsApi.checkout({
        planId: targetId,
        billingCycle: cycle as BillingCycle,
      });
      checkout = data;
    } catch (err) {
      // Detect the env-var-not-set case (BE returns 503 PaystackNotConfigured)
      // and surface a clearer message so the user/ops can fix it.
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.status === 503) {
        toast.error(
          "Paystack isn't set up yet",
          "Ops needs to add PAYSTACK_SECRET_KEY on the backend before checkout works.",
        );
      } else {
        toast.error(
          "Couldn't start checkout",
          apiErr?.message ?? "Please try again.",
        );
      }
      setUpgrading(null);
      return;
    }

    // Prefer Paystack Inline (modal on our page) when the SDK is loaded
    // and we have the public key + tenant email. Falls back to the BE's
    // hosted-checkout URL if any prerequisite is missing — same user value,
    // worse UX but never broken.
    const targetPlan = PLAN_CATALOG.find((p) => p.id === targetId);
    const email = meQ.data?.user?.email;
    const monthly = targetPlan?.monthly;
    const amountKobo = monthly ? monthly * 100 : null;
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (paystackInlineAvailable() && publicKey && email && amountKobo) {
      try {
        openPaystackInline({
          key: publicKey,
          email,
          amount: amountKobo,
          ref: checkout.reference,
          metadata: { planId: targetId, billingCycle: cycle },
          callback: async (response) => {
            // Modal closes immediately on success — verify with BE and
            // refresh the subscription state so the page updates inline.
            try {
              const { data: v } = await subscriptionsApi.verify(response.reference);
              if (v.status === "success") {
                toast.success(
                  "Subscription activated",
                  `You're on the ${v.subscription?.planDisplayName ?? targetPlan?.name ?? "new"} plan.`,
                );
              } else if (v.status === "pending") {
                toast.success(
                  "Payment received — confirming with Paystack",
                  "Your subscription will activate shortly.",
                );
              } else {
                toast.error(
                  "Payment didn't complete",
                  v.failureReason ?? "Try again or pick a different plan.",
                );
              }
            } catch {
              toast.toast({
                tone: "info",
                title: "Payment sent — verifying",
                description: "Refresh in a moment to see your updated plan.",
              });
            } finally {
              sub.refetch();
              setUpgrading(null);
            }
          },
          onClose: () => {
            // User dismissed the modal without paying. No charge happened
            // and no FE state to roll back — just clear the spinner.
            toast.toast({
              tone: "info",
              title: "Payment cancelled",
              description: "No charges were made — pick a plan again whenever you're ready.",
            });
            setUpgrading(null);
          },
        });
      } catch {
        // SDK loaded but threw — fall back to the redirect path so the
        // user can still complete payment.
        toast.toast({
          tone: "info",
          title: "Opening Paystack",
          description: "Falling back to the hosted checkout page.",
        });
        window.location.href = checkout.authorizationUrl;
      }
      return;
    }

    // Fallback path — redirect to the BE-generated hosted-checkout URL.
    // Spinner stays through the navigate (no flicker back to idle).
    toast.success("Redirecting to Paystack…", "Complete payment to activate your plan.");
    window.location.href = checkout.authorizationUrl;
  }

  return (
    <SettingsShell active="billing" title="Subscription & Billing" description="Manage your plan, payment method, and invoices.">
      <div className="space-y-8">
        {/* Hard error — only shown for real network/server failures, not
            "this tenant has no sub yet" (which is a normal first-visit). */}
        {isHardError && (
          <div className="rounded-xl border border-danger/30 bg-rose-500/[0.06] px-5 py-4">
            <p className="text-[14px] font-medium text-white">Couldn't load your subscription</p>
            <p className="mt-1 text-[13px] text-white/65">
              {subError instanceof ApiError ? subError.message : "Please try again."}
            </p>
            <Button variant="secondary" size="md" className="mt-3" onClick={sub.refetch}>
              Try again
            </Button>
          </div>
        )}

        {/* Loading state — light placeholder so the picker reveals smoothly. */}
        {sub.loading && (
          <div className="h-20 animate-pulse rounded-xl bg-white/[0.02]" />
        )}

        {/* No active subscription — guidance banner that frames the picker
            below as the path forward. Shown when BE explicitly reports
            "no active subscription" (404 or the message check). */}
        {!sub.loading && isMissingSubscription && (
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.08] px-5 py-4">
            <Info className="mt-0.5 shrink-0 text-primary" size={20} />
            <div>
              <p className="text-[14px] font-medium text-white">No active subscription yet</p>
              <p className="mt-0.5 text-[13px] text-white/65">
                Pick a plan below to activate your workspace. We'll redirect you to Paystack to complete payment.
              </p>
            </div>
          </div>
        )}

        {/* Active subscription state — trial banner + current-plan card */}
        {data && (
          <>
            {data.status === "trialing" && data.trialEndsAt && (
              <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-amber-500/15 px-5 py-4">
                <Sparkles className="mt-0.5 shrink-0 text-amber-300" size={20} />
                <div>
                  <p className="text-[14px] font-medium text-white">
                    {data.daysRemaining > 0
                      ? `${data.daysRemaining} day${data.daysRemaining === 1 ? "" : "s"} left in your free trial`
                      : "Your trial ends today"}
                  </p>
                  <p className="mt-0.5 text-[13px] text-white/65">
                    Trial ends {fmtDate(data.trialEndsAt)}. Add billing details to keep your workspace live after that.
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-white/[0.06] bg-cinema-elev p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="text-[18px] font-medium text-white">{data.planDisplayName}</h3>
                    <Chip tone={statusChip[data.status].tone}>{statusChip[data.status].label}</Chip>
                  </div>
                  {data.amountPaid > 0 && (
                    <p className="font-mono text-[14px] text-white/65">
                      {naira(data.amountPaid)} / {data.billingCycle}
                    </p>
                  )}
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] text-white/45">
                    <CalendarClock size={14} />
                    {data.cancelledAt
                      ? `Cancelled — access ends ${fmtDate(data.expiresAt)}`
                      : data.status === "trialing"
                      ? `Trial ends ${fmtDate(data.trialEndsAt)}`
                      : `Renews ${fmtDate(data.expiresAt)}`}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Plan picker — ALWAYS rendered. Doesn't depend on a current sub
            existing; that's the whole point of this page on a fresh tenant. */}
        {!isHardError && (
          <div>
            <h2 className="mb-1 text-[18px] font-medium tracking-[-0.01em] text-white">
              {data ? "Change plan" : "Choose a plan"}
            </h2>
            <p className="mb-5 text-[14px] text-white/65">
              {data
                ? "Upgrades take effect immediately and are prorated. Downgrades apply at the end of your billing period."
                : "All plans include a 14-day free trial. You won't be charged until day 15."}
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {PLAN_CATALOG.map((p) => {
                const isCurrent = p.id === currentPlan;
                const isCustom = p.id === "scaler";
                const price = isCustom ? `From ${naira(p.monthly!)}` : naira(p.monthly!);
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border bg-cinema-elev p-5 ${
                      isCurrent
                        ? "border-2 border-primary"
                        : "border-white/[0.06] hover:border-primary-light"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-white/65">
                        {p.name}
                      </p>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-primary">
                          <CheckCircle2 size={12} /> Current
                        </span>
                      )}
                    </div>
                    <div className="mb-2 flex items-baseline gap-1">
                      <span className="font-mono text-[22px] text-white">{price}</span>
                      <span className="text-[13px] text-white/45">/month</span>
                    </div>
                    <p className="mb-4 text-[13px] text-white/65">{p.blurb}</p>
                    <Button
                      variant={isCurrent ? "secondary" : "primary"}
                      size="md"
                      className="w-full"
                      disabled={isCurrent || upgrading !== null}
                      onClick={() => selectPlan(p.id)}
                    >
                      {upgrading === p.id ? "Switching…" : isCurrent ? "Current plan" : isCustom ? (
                        <>Book a call <ArrowUpRight size={15} /></>
                      ) : (
                        "Switch to this plan"
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SettingsShell>
  );
}
