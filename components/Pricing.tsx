"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Section, Eyebrow } from "./ui/Section";
import { Button } from "./ui/Button";
import { APP_DOMAIN, mailtoSupport } from "@/lib/brand";

// Plans match conddo-pricing-tiers.md (the canonical source). When this is
// hooked up to /billing/plans (BILLING_TIERS_SPEC.md), this static catalog
// gets replaced with the API response — but the wire shape stays compatible.
type Plan = {
  id: "launcher" | "growth" | "scaler";
  name: string;
  monthly: number | null;           // ₦; null for Scaler (custom)
  quarterly: number | null;         // ₦; null for Scaler
  quarterlySavings: number | null;  // ₦; null for Scaler
  blurb: string;
  inherits?: string;
  features: string[];
  popular?: boolean;
  cta: { label: string; href: string };
};

const plans: Plan[] = [
  {
    id: "launcher",
    name: "Launcher",
    monthly: 20_000,
    quarterly: 54_000,
    quarterlySavings: 6_000,
    blurb: "For businesses going digital for the first time.",
    features: [
      `Custom website (${APP_DOMAIN} subdomain)`,
      "Payment collection",
      "CRM & customer records",
      "Order management",
      "Bookings",
      "Inventory management",
      "Basic analytics",
      "2 staff accounts",
      "Email support",
    ],
    cta: { label: "Start free trial", href: "/onboarding/create-account?plan=launcher" },
  },
  {
    id: "growth",
    name: "Growth",
    monthly: 45_000,
    quarterly: 120_000,
    quarterlySavings: 15_000,
    blurb: "For businesses actively selling every day.",
    inherits: "Everything in Launcher, plus",
    features: [
      "Custom .com.ng domain + business email",
      "Customer self-booking on your website",
      "Email & SMS campaigns",
      "Social scheduler",
      "Ad management",
      "Marketing dashboard",
      "5 staff accounts",
      "WhatsApp support",
    ],
    popular: true,
    cta: { label: "Start free trial", href: "/onboarding/create-account?plan=growth" },
  },
  {
    id: "scaler",
    name: "Scaler",
    monthly: 120_000,
    quarterly: null,                 // custom — invoiced per agreement
    quarterlySavings: null,
    blurb: "For established businesses with teams, multiple locations, or custom needs.",
    inherits: "Everything in Growth, plus",
    features: [
      "Multi-location management",
      "Unlimited staff accounts",
      "Advanced analytics & reports",
      "Full API access",
      "Dedicated account manager",
      "Custom module configuration",
      "Priority phone support",
    ],
    cta: { label: "Book a free consultation", href: mailtoSupport("Scaler consultation") },
  },
];

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "quarterly">("monthly");
  const isQuarterly = billing === "quarterly";

  return (
    <Section tone="bg" id="pricing">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="text-[34px] leading-tight tracking-[-0.01em] md:text-[40px]">
          Simple plans. No hidden fees.
        </h2>
      </div>

      {/* Billing toggle — Monthly / Quarterly. Quarterly = ~10% off; the
          per-card "Save ₦X" tag makes the discount concrete. Scaler stays
          custom regardless. */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div
          role="tablist"
          aria-label="Billing period"
          className="inline-flex items-center rounded-full border border-neutral-border bg-neutral-surface p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isQuarterly}
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors ${
              !isQuarterly ? "bg-primary text-white" : "text-content-secondary hover:text-ink"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isQuarterly}
            onClick={() => setBilling("quarterly")}
            className={`relative rounded-full px-5 py-1.5 text-[13px] font-medium transition-colors ${
              isQuarterly ? "bg-primary text-white" : "text-content-secondary hover:text-ink"
            }`}
          >
            Quarterly
            <span
              className={`ml-2 inline-block rounded-full px-1.5 py-0.5 font-mono text-[10px] tracking-[0.04em] ${
                isQuarterly ? "bg-white/20 text-white" : "bg-success-bg text-success"
              }`}
            >
              Save
            </span>
          </button>
        </div>
        <p className="font-mono text-[11px] text-content-muted">
          {isQuarterly ? "Billed every 3 months — save up to ₦15,000." : "Billed monthly. Cancel any time."}
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 items-start gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          // Scaler is custom — same "Starting from ₦120,000/mo" message in
          // either toggle state. Other plans show the toggled price + save tag.
          const showCustom = plan.id === "scaler";
          const price = showCustom
            ? `From ${naira(plan.monthly!)}`
            : isQuarterly && plan.quarterly != null
            ? naira(plan.quarterly)
            : naira(plan.monthly!);
          const unit = showCustom ? "/month" : isQuarterly ? "/quarter" : "/month";
          const saving =
            !showCustom && isQuarterly && plan.quarterlySavings != null
              ? `Save ${naira(plan.quarterlySavings)} vs monthly`
              : null;

          return (
            <div
              key={plan.id}
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
                  {price}
                </span>
                <span className="text-[14px] text-content-muted">{unit}</span>
              </div>
              {saving && (
                <p className="mt-1.5 font-mono text-[11px] text-success">{saving}</p>
              )}
              {showCustom && (
                <p className="mt-1.5 font-mono text-[11px] text-content-muted">
                  Custom — invoiced per agreement
                </p>
              )}

              <p className="mt-3 text-[14px] leading-relaxed text-content-secondary">
                {plan.blurb}
              </p>

              <div className="my-6 h-px bg-neutral-border" />

              {plan.inherits && (
                <p className="mb-3 text-[13px] font-medium text-ink">{plan.inherits}</p>
              )}
              <ul className="mb-7 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={17} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.5} />
                    <span className="text-[14px] text-content-secondary">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                href={`${plan.cta.href}${plan.id !== "scaler" ? `&billing=${billing}` : ""}`}
                variant={plan.popular ? "primary" : "secondary"}
                size="md"
                className="w-full"
              >
                {plan.cta.label}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-[14px] text-content-secondary">
        14-day free trial on Launcher and Growth. No credit card required.
      </p>
    </Section>
  );
}
