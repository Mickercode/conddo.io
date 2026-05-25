"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep } from "@/lib/onboarding-steps";

// Built from the Stitch "Plan Selection" screen. Pricing ₦25k/45k/80k is the
// design's canonical (matches the landing page).
type Plan = {
  id: string;
  name: string;
  blurb: string;
  price: string;
  inherits?: string;
  features: string[];
  popular?: boolean;
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    blurb: "For businesses getting properly set up.",
    price: "₦25,000",
    features: ["Website", "CRM", "Payment processing", "Business analytics"],
  },
  {
    id: "business",
    name: "Business",
    blurb: "For businesses ready to grow.",
    price: "₦45,000",
    inherits: "Everything in Starter",
    features: [
      "Booking & Orders",
      "Inventory",
      "Social media scheduler",
      "Email/SMS campaigns",
      "Marketing dashboard",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "For businesses running serious operations.",
    price: "₦80,000",
    inherits: "Everything in Business",
    features: ["Ad management", "API access", "Advanced analytics", "Priority support"],
  },
];

export default function ChoosePlanStep() {
  const router = useRouter();
  const { update } = useOnboarding();
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error] = useState<string | null>(null);

  // Just record the plan and advance — the tenant is created at the final step
  // (POST /auth/register/complete on the "ready" page), which issues the JWT.
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
        <p className="mt-2 text-[16px] text-content-secondary">
          14 days free on every plan. No credit card needed.
        </p>
      </header>

      {error && (
        <div className="mb-6 flex w-full max-w-5xl items-center gap-2 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-[14px] text-danger">
          <AlertCircle size={18} className="shrink-0" /> {error}
        </div>
      )}

      <div className="grid w-full max-w-5xl grid-cols-1 items-start gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex h-full flex-col rounded-xl bg-neutral-surface p-7 ${
              plan.popular
                ? "border-2 border-primary md:-mt-4 md:pb-9 md:pt-9"
                : "border border-neutral-border"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                Most popular
              </span>
            )}

            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-content-secondary">
              {plan.name}
            </p>
            <p className="mt-1.5 text-[14px] leading-relaxed text-content-secondary">
              {plan.blurb}
            </p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-mono text-[30px] font-medium leading-none text-ink">
                {plan.price}
              </span>
              <span className="text-[14px] text-content-muted">/month</span>
            </div>

            <div className="my-6 h-px bg-neutral-border" />

            {plan.inherits && (
              <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.05em] text-content-secondary">
                {plan.inherits} +
              </p>
            )}
            <ul className="mb-7 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CircleCheck size={17} className="mt-0.5 shrink-0 text-primary" />
                  <span className="text-[14px] text-content-secondary">{f}</span>
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

      <div className="mt-8 flex flex-col items-center gap-1.5 text-center">
        <a href="#" className="text-[14px] font-medium text-primary hover:underline">
          Save 2 months with an annual plan
        </a>
        <p className="text-[13px] text-content-muted">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </>
  );
}
