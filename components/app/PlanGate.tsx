"use client";

import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Wire-shape that backend returns on a 403 PLAN_UPGRADE_REQUIRED — see
// backend/BILLING_TIERS_SPEC.md §5. The FE can also synthesize this locally
// when it knows the current plan doesn't unlock a feature (so the UI doesn't
// even hit the API first).
export type PlanUpgradeHint = {
  /** "Ad management is available on the Growth plan." */
  message: string;
  /** "Growth" — the plan name that unlocks it. */
  requiredPlan?: string;
  /** Monthly price in ₦ — used for the inline price hint. */
  requiredPlanPrice?: number;
  /** Where to send the user to upgrade. Default /settings/billing. */
  upgradeUrl?: string;
};

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/** Locked-feature placeholder shown in place of the gated UI. Tone is
 *  "this is here, you just need a bigger plan", never "this is broken". */
export function PlanGate({
  title,
  hint,
}: {
  title: string;            // e.g. "Ad management"
  hint: PlanUpgradeHint;
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-neutral-border bg-neutral-surface p-8 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-bg text-primary">
        <Lock size={22} />
      </span>
      <h2 className="text-[20px] tracking-[-0.01em] text-ink">{title}</h2>
      <p className="mt-2 text-[14px] leading-relaxed text-content-secondary">
        {hint.message}
      </p>
      {hint.requiredPlan && hint.requiredPlanPrice && (
        <p className="mt-2 font-mono text-[12px] text-content-muted">
          {hint.requiredPlan} · from {naira(hint.requiredPlanPrice)}/month
        </p>
      )}
      <div className="mt-6 flex flex-col items-center gap-2">
        <Button href={hint.upgradeUrl ?? "/settings/billing"} variant="primary" size="md">
          <Sparkles size={15} /> Upgrade plan
        </Button>
        <a
          href="mailto:hello@conddo.io?subject=Plan%20questions"
          className="text-[13px] text-content-muted hover:text-ink"
        >
          Talk to sales
        </a>
      </div>
    </div>
  );
}
