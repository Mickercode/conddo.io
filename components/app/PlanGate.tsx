"use client";

import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { planUpgradeDetails } from "@/lib/api/client";
import { mailtoSales } from "@/lib/brand";

// Wire-shape that backend returns on a 403 PLAN_UPGRADE_REQUIRED — see
// backend/BILLING_TIERS_SPEC.md §5. The FE can also synthesize this locally
// when it knows the current plan doesn't unlock a feature.
export type PlanUpgradeHint = {
  message: string;
  requiredPlan?: string;
  requiredPlanPrice?: number;
  upgradeUrl?: string;
};

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/** Extract a PlanGate hint from an ApiError raised by the API client.
 *  Returns null if the error isn't a plan-upgrade signal — caller renders
 *  whatever normal error UI it has. */
export function hintFromError(err: unknown, fallbackMessage?: string): PlanUpgradeHint | null {
  const d = planUpgradeDetails(err);
  if (!d) return null;
  const message =
    err instanceof Error && err.message
      ? err.message
      : fallbackMessage ?? "This feature requires a higher plan.";
  return {
    message,
    requiredPlan: d.requiredPlan,
    requiredPlanPrice: d.requiredPlanPrice,
    upgradeUrl: d.upgradeUrl,
  };
}

/** Locked-feature placeholder shown in place of the gated UI. Tone is
 *  "this is here, you just need a bigger plan", never "this is broken". */
export function PlanGate({
  title = "This feature",
  hint,
}: {
  title?: string;
  hint: PlanUpgradeHint;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-white/[0.06] bg-cinema-elev p-8 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
        <Lock size={22} />
      </span>
      <h2 className="text-[20px] tracking-[-0.01em] text-white">{title}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-white/65">{hint.message}</p>
      {hint.requiredPlan && hint.requiredPlanPrice && (
        <p className="mt-2 font-mono text-[12px] text-white/45">
          {hint.requiredPlan} · from {naira(hint.requiredPlanPrice)}/month
        </p>
      )}
      <div className="mt-6 flex flex-col items-center gap-2">
        <Button href={hint.upgradeUrl ?? "/settings/billing"} variant="primary" size="md">
          <Sparkles size={15} /> Upgrade plan
        </Button>
        <a
          href={mailtoSales("Plan questions")}
          className="text-[13px] text-white/45 hover:text-white"
        >
          Talk to sales
        </a>
      </div>
    </div>
  );
}
