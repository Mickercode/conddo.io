"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { mailtoSales } from "@/lib/brand";

/** Cinematic pricing block — three plan cards above a Monthly/Quarterly
 *  toggle. Same dark-on-dark surface as the rest of the cinematic system.
 *  Growth plan gets a "Most Popular" ribbon and a primary-accented border.
 *
 *  The plan data here is the single source of truth for /pricing's three
 *  cards. Compare-plans matrix below reads from a separate spec because
 *  its feature roster is denser. */

type Cycle = "monthly" | "quarterly";

type Plan = {
  id: "launcher" | "growth" | "scaler";
  name: string;
  blurb: string;
  /** Naira amount per cycle. null on Scaler quarterly = "Talk to sales". */
  prices: { monthly: number; quarterly: number | null };
  /** Note rendered under the price, e.g. "Save ₦6,000". */
  savings?: { quarterly: number };
  inherits?: string;
  features: string[];
  popular?: boolean;
  cta: { label: string; href: string };
};

const plans: Plan[] = [
  {
    id: "launcher",
    name: "Launcher",
    blurb: "Everything you need to run your business online.",
    prices: { monthly: 20_000, quarterly: 54_000 },
    savings: { quarterly: 6_000 },
    features: [
      "Website & online presence",
      "Customers & CRM",
      "Orders & bookings",
      "Payments",
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
    blurb: "For growing businesses ready to automate and scale.",
    prices: { monthly: 45_000, quarterly: 120_000 },
    savings: { quarterly: 15_000 },
    inherits: "Everything in Launcher, plus:",
    features: [
      "Custom domain",
      "Business email",
      "Email & SMS campaigns",
      "Social media scheduling",
      "Marketing dashboard",
      "Advanced customer engagement",
      "5 staff accounts",
      "Priority support",
    ],
    popular: true,
    cta: { label: "Start free trial", href: "/onboarding/create-account?plan=growth" },
  },
  {
    id: "scaler",
    name: "Scaler",
    blurb: "For teams with advanced operational needs.",
    prices: { monthly: 120_000, quarterly: null },
    inherits: "Everything in Growth, plus:",
    features: [
      "Multi-location management",
      "Unlimited staff accounts",
      "Advanced analytics & reporting",
      "API access",
      "Dedicated account manager",
      "Custom configurations",
      "Priority phone support",
    ],
    cta: { label: "Talk to sales", href: mailtoSales("Scaler plan") },
  },
];

export function CinematicPricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-16 md:py-24">
        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <CycleToggle value={cycle} onChange={setCycle} />
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {plans.map((p, i) => (
            <PlanCard key={p.id} plan={p} cycle={cycle} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CycleToggle({
  value,
  onChange,
}: {
  value: Cycle;
  onChange: (c: Cycle) => void;
}) {
  return (
    <div className="relative inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.04] p-1 backdrop-blur">
      {(["monthly", "quarterly"] as const).map((c) => {
        const active = value === c;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`relative z-10 px-5 py-2 text-[13px] font-medium tracking-tight transition-colors rounded-full ${
              active ? "text-white" : "text-white/55 hover:text-white/85"
            }`}
          >
            {active && (
              <motion.span
                layoutId="cycle-toggle-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative">
              {c[0].toUpperCase() + c.slice(1)}
              {c === "quarterly" && (
                <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.1em] ${
                  active ? "bg-white/15 text-white" : "bg-primary/15 text-primary-light"
                }`}>
                  Save
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PlanCard({ plan, cycle, index }: { plan: Plan; cycle: Cycle; index: number }) {
  const price = plan.prices[cycle];
  const savings = cycle === "quarterly" ? plan.savings?.quarterly : undefined;

  return (
    <motion.div
      className={`relative rounded-3xl border p-7 md:p-8 backdrop-blur transition-colors ${
        plan.popular
          ? "border-primary/45 bg-primary/[0.04]"
          : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]"
      }`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.08 + index * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
    >
      {plan.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-primary px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-white">
          Most popular
        </span>
      )}

      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-light">
        {plan.name}
      </p>
      <p className="mt-2 text-[14px] text-white/55 leading-relaxed">{plan.blurb}</p>

      {/* Price */}
      <div className="mt-6 flex items-baseline gap-2">
        {price === null ? (
          <p className="font-mono text-3xl md:text-4xl font-medium text-white">Custom</p>
        ) : (
          <>
            <p className="font-mono text-3xl md:text-[42px] font-medium text-white leading-none tabular-nums">
              ₦{price.toLocaleString("en-NG")}
            </p>
            <span className="text-[13px] text-white/40">/{cycle === "monthly" ? "mo" : "qtr"}</span>
          </>
        )}
      </div>

      {plan.id === "scaler" && cycle === "monthly" && (
        <p className="mt-1 text-[12px] text-white/40">From ₦120,000/month</p>
      )}
      {savings && (
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-light">
          Save ₦{savings.toLocaleString("en-NG")}
        </p>
      )}

      {/* CTA */}
      <Link
        href={plan.cta.href}
        className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[14px] font-medium transition-colors ${
          plan.popular
            ? "bg-primary text-white hover:bg-primary-hover"
            : "border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        }`}
      >
        {plan.cta.label}
        <ArrowRight size={14} />
      </Link>

      {plan.inherits && (
        <p className="mt-7 text-[12px] uppercase tracking-[0.12em] text-white/40 font-mono">
          {plan.inherits}
        </p>
      )}

      {/* Feature list */}
      <ul className={`${plan.inherits ? "mt-3" : "mt-7"} space-y-2.5`}>
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[14px] text-white/80">
            <Check size={14} className="mt-1 shrink-0 text-primary-light" strokeWidth={2.5} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      {plan.id === "launcher" && (
        <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/40">
          14-day free trial · No credit card required
        </p>
      )}
    </motion.div>
  );
}
