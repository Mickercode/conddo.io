import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Pricing } from "@/components/Pricing";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Pricing — Conddo.io",
  description:
    "Three plans — Launcher, Growth, Scaler. Naira pricing. 14-day free trial on every plan. Built for Nigerian businesses.",
};

/** /pricing — full tier matrix + FAQ. We reuse the existing Pricing
 *  component (it's already the canonical version with monthly/quarterly
 *  toggle, popular flag, plan-comparison) and FAQ (which is mostly
 *  pricing-adjacent questions). */
export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="marketing-hero-dark relative overflow-hidden">
        <div className="marketing-hero-dark-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative py-20 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-primary-light backdrop-blur">
              <Sparkles size={11} className="text-primary-light" />
              Naira pricing · 14-day free trial
            </span>
            <h1 className="text-balance text-[42px] font-medium leading-[1.05] tracking-[-0.02em] text-white md:text-[56px]">
              Simple plans. No surprises.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[17px] leading-relaxed text-white/70">
              Pay monthly or save with quarterly. Upgrade anytime as you grow. Every plan starts with 14 days free — no credit card required.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-neutral-bg">
        <Reveal><Pricing /></Reveal>
        <Reveal><FAQ /></Reveal>
      </div>
      <FinalCTA />
    </MarketingShell>
  );
}
