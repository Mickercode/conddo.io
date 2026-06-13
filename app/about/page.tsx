import type { Metadata } from "next";
import { Sparkles, Heart, Target, Compass } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { BentoGrid, BentoCard } from "@/components/marketing/BentoGrid";
import { RealBusinesses } from "@/components/RealBusinesses";
import { SocialProof } from "@/components/SocialProof";
import { FinalCTA } from "@/components/FinalCTA";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About — Conddo.io",
  description:
    "Why Conddo.io exists, who it's for, and what we believe about building tools for Nigerian businesses.",
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <section className="marketing-hero-dark relative overflow-hidden">
        <div className="marketing-hero-dark-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-primary-light backdrop-blur">
              <Sparkles size={11} className="text-primary-light" />
              About Conddo.io
            </span>
            <h1 className="text-balance text-[42px] font-medium leading-[1.05] tracking-[-0.02em] text-white md:text-[56px]">
              Built for the way Nigerian businesses actually run.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[17px] leading-relaxed text-white/70">
              Most business software is built for someone else's market. We build for ours — in Naira, on phones, with the tools real shops, salons, pharmacies, and studios actually need.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-neutral-bg py-20 md:py-28">
        <div className="container-x">
          <SectionHeader
            eyebrow="What we believe"
            title={<>Tools should fit the business, <span className="text-primary">not the other way around</span>.</>}
            lede="Too many platforms ask Nigerian businesses to adapt — to dollar billing, to one-size-fits-all workflows, to features they'll never use. We do the opposite."
          />

          <BentoGrid>
            <BentoCard
              span="md"
              icon={Target}
              eyebrow="Focused"
              title="One workspace per business type"
              description="Pharmacy gets clinical records, drug programs, and refill workflows. Fashion gets sizing tables and custom fittings. We build for verticals, not for everyone."
            />
            <BentoCard
              span="md"
              icon={Heart}
              eyebrow="Local-first"
              title="Naira, not dollars"
              description="Paystack for online + subscriptions, Routepay for in-person and deposits. Local payment rails, local price points, no dollar card required."
            />
            <BentoCard
              span="md"
              icon={Compass}
              eyebrow="Owner-friendly"
              title="Setup in minutes, not weeks"
              description="No implementation team, no consultants, no training videos. If you can use WhatsApp Business, you can run Conddo."
            />
            <BentoCard
              span="md"
              title="On phones first"
              description="Most Nigerian SME owners run their business from a phone. Every Conddo screen is designed mobile-first, then scaled up for desktop — not the other way around."
              eyebrow="Mobile-first"
            />
            <BentoCard
              span="full"
              eyebrow="Why now"
              title="A platform built for the next million Nigerian SMEs"
              description="Smartphone penetration crossed 50%. Local payment rails are mature. The next million businesses won't be built on Excel and WhatsApp Status — they'll be built on platforms that finally take them seriously. That's what we're building."
            />
          </BentoGrid>
        </div>
      </section>

      <Reveal><RealBusinesses /></Reveal>
      <Reveal><SocialProof /></Reveal>
      <FinalCTA />
    </MarketingShell>
  );
}
