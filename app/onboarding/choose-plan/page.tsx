"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep } from "@/lib/onboarding-steps";

// Plan IDs match the canonical catalog in conddo-pricing-tiers.md /
// backend/BILLING_TIERS_SPEC.md. Self-serve onboarding only offers Launcher
// + Growth — Scaler is booked via sales, no self-serve trial.
type Plan = {
  id: "launcher" | "growth";
  name: string;
  blurb: string;
  price: string;
  inherits?: string;
  features: string[];
  popular?: boolean;
};

const plans: Plan[] = [
  {
    id: "launcher",
    name: "Launcher",
    blurb: "For businesses going digital for the first time.",
    price: "₦20,000",
    features: [
      "Custom website",
      "Payment collection",
      "CRM + Orders + Bookings",
      "Inventory management",
      "Basic analytics",
      "2 staff accounts",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    blurb: "For businesses actively selling every day.",
    price: "₦45,000",
    inherits: "Everything in Launcher",
    features: [
      "Custom .com.ng domain + business email",
      "Customer self-booking on your website",
      "Email & SMS campaigns",
      "Social scheduler",
      "Ad management",
      "5 staff accounts",
    ],
    popular: true,
  },
];

export default function ChoosePlanStep() {
  const router = useRouter();
  const { update } = useOnboarding();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error] = useState<string | null>(null);

  // Record the plan + advance — the tenant is created at the final step
  // (POST /auth/register/complete on the "ready" page), which issues the JWT
  // carrying the plan in activeModules.
  const select = (planId: string) => {
    update({ planId });
    setSubmitting(planId);
    const next = nextStep("choose-plan");
    if (next) router.push(hrefFor(next.slug));
  };

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[32px]">
          Choose your plan.
        </h1>
        <p className="mt-2 text-[16px] text-white/65">
          14 days free on every plan. No credit card needed.
        </p>
      </header>

      {error && (
        <div className="mb-6 flex w-full max-w-3xl items-center gap-2 rounded-lg border border-danger/20 bg-rose-500/[0.06] px-4 py-3 text-[14px] text-rose-200">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid w-full max-w-3xl grid-cols-1 items-start gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex h-full flex-col rounded-xl bg-cinema-elev p-7 ${
              plan.popular
                ? "border-2 border-primary md:-mt-4 md:pb-9 md:pt-9"
                : "border border-white/[0.06]"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                Most popular
              </span>
            )}

            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-white/65">
              {plan.name}
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-white/65">
              {plan.blurb}
            </p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-mono text-[30px] font-medium leading-none text-white">
                {plan.price}
              </span>
              <span className="text-[14px] text-white/45">/month</span>
            </div>

            <div className="my-6 h-px bg-neutral-border" />

            {plan.inherits && (
              <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.05em] text-white/65">
                {plan.inherits} +
              </p>
            )}
            <ul className="mb-7 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CircleCheck size={17} className="mt-0.5 shrink-0 text-primary" />
                  <span className="text-[14px] text-white/65">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => select(plan.id)}
              variant={plan.popular ? "primary" : "secondary"}
              size="md"
              className="w-full"
              disabled={submitting !== null}
            >
              {submitting === plan.id ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating account…
                </>
              ) : (
                "Start free trial"
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center gap-2 text-center">
        <p className="text-[13px] text-white/45">
          Running 3+ locations or a team that needs custom workflows?
        </p>
        <a
          href="mailto:hello@conddo.io?subject=Scaler%20consultation"
          className="text-[14px] font-medium text-primary hover:underline"
        >
          Book a Scaler consultation →
        </a>
      </div>
    </>
  );
}
