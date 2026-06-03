"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Section, Eyebrow } from "./ui/Section";
import { Button } from "./ui/Button";

type Plan = {
  name: string;
  /** Monthly price in Naira (number — formatted on render). */
  monthly: number;
  blurb: string;
  inherits?: string;
  features: string[];
  popular?: boolean;
};

// Save 2 months on annual ⇒ annual = monthly × 10 (Conddo's published terms).
const ANNUAL_MULTIPLIER = 10;

const plans: Plan[] = [
  {
    name: "Starter",
    monthly: 25_000,
    blurb: "Everything to get online and start selling.",
    features: ["Website", "CRM", "Payments", "Analytics"],
  },
  {
    name: "Business",
    monthly: 45_000,
    blurb: "For growing businesses that market actively.",
    inherits: "Everything in Starter, plus",
    features: [
      "Bookings",
      "Order management",
      "Social scheduler",
      "Email & SMS campaigns",
      "Marketing dashboard",
    ],
    popular: true,
  },
  {
    name: "Pro",
    monthly: 80_000,
    blurb: "For established businesses scaling with ads.",
    inherits: "Everything in Business, plus",
    features: [
      "Ad management",
      "API access",
      "Advanced analytics",
      "Priority support",
    ],
  },
];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const isAnnual = billing === "annual";

  return (
    <Section tone="bg" id="pricing">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="text-[34px] leading-tight tracking-[-0.01em] md:text-[40px]">
          Simple plans. No hidden fees.
        </h2>
      </div>

      {/* Billing toggle — the user-visible saving driver. Two-month discount on
          annual is rendered as a contextual badge so the choice is concrete. */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div
          role="tablist"
          aria-label="Billing period"
          className="inline-flex items-center rounded-full border border-neutral-border bg-neutral-surface p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isAnnual}
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors ${
              !isAnnual ? "bg-primary text-white" : "text-content-secondary hover:text-ink"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isAnnual}
            onClick={() => setBilling("annual")}
            className={`relative rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors ${
              isAnnual ? "bg-primary text-white" : "text-content-secondary hover:text-ink"
            }`}
          >
            Annual
            <span
              className={`ml-2 inline-block rounded-full px-1.5 py-0.5 font-mono text-[10px] tracking-[0.04em] ${
                isAnnual ? "bg-white/20 text-white" : "bg-success-bg text-success"
              }`}
            >
              −2 months
            </span>
          </button>
        </div>
        <p className="font-mono text-[11px] text-content-muted">
          {isAnnual ? "Billed yearly — save 2 months on every plan." : "Billed monthly. Cancel any time."}
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 items-start gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const annual = plan.monthly * ANNUAL_MULTIPLIER;
          const displayedPrice = isAnnual ? naira(annual) : naira(plan.monthly);
          const displayedUnit = isAnnual ? "/year" : "/month";
          const annualSaving = plan.monthly * 2;

          return (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-lg bg-neutral-surface p-7 ${
                plan.popular
                  ? "border-2 border-primary md:-mt-3 md:pb-9 md:pt-9"
                  : "border border-neutral-border"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-7 inline-flex items-center rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                  ★ Most popular
                </span>
              )}

              <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-content-secondary">
                {plan.name}
              </p>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-mono text-[36px] font-medium leading-none text-ink">
                  {displayedPrice}
                </span>
                <span className="text-[14px] text-content-muted">{displayedUnit}</span>
              </div>
              {isAnnual && (
                <p className="mt-1.5 font-mono text-[11px] text-success">
                  Save {naira(annualSaving)} vs monthly
                </p>
              )}

              <p className="mt-3 text-[14px] leading-relaxed text-content-secondary">
                {plan.blurb}
              </p>

              <div className="my-6 h-px bg-neutral-border" />

              {plan.inherits && (
                <p className="mb-3 text-[13px] font-medium text-ink">
                  {plan.inherits}
                </p>
              )}
              <ul className="mb-7 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      size={17}
                      className="mt-0.5 shrink-0 text-primary"
                      strokeWidth={2.5}
                    />
                    <span className="text-[14px] text-content-secondary">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                href={`/onboarding/create-account?plan=${plan.name.toLowerCase()}&billing=${billing}`}
                variant={plan.popular ? "primary" : "secondary"}
                size="md"
                className="w-full"
              >
                Start free trial
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-[14px] text-content-secondary">
        14-day free trial on all plans. No credit card required.
      </p>
    </Section>
  );
}
