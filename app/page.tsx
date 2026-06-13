import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { LiquidText } from "@/components/marketing/cinematic/LiquidText";
import { StickyScrollChapter } from "@/components/marketing/cinematic/StickyScrollStory";
import { AnimatedBento } from "@/components/marketing/cinematic/AnimatedBento";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";
import { FinalCTA } from "@/components/FinalCTA";

export const metadata: Metadata = {
  title: "Conddo.io — Sell more. Stress less.",
  description:
    "Everything your business needs to sell, operate, and grow. Your website, customers, orders, and marketing — one platform, built for Nigerian businesses.",
  openGraph: {
    title: "Conddo.io — Sell more. Stress less.",
    description:
      "Everything your business needs to sell, operate, and grow. One platform, built for your type of business.",
    type: "website",
  },
};

/** Cinematic home — six beats:
 *   1. HeroGeometric    — full-bleed dark hero with floating gradient pills
 *                          and liquid-morphing inline word
 *   2. AnimatedBento     — six modules, each its own live mini-experience
 *   3. StickyScrollChapter ×3 — Apple-style chapter sequence walking through
 *                          Website → Operations → Marketing
 *   4. FinalCTA          — the closing strip
 *
 *  Each chapter pins a sticky image while overlay copy slides over it,
 *  then hands off to the next. Photos in /public/people/ are reused for
 *  the chapter visuals so the page lands on Nigerian-business-owner faces
 *  rather than generic stock. */
export default function Home() {
  return (
    <MarketingShell>
      <HeroGeometric
        eyebrow="Built for Nigerian businesses"
        titleTop="Run your"
        titleBottom={
          <>
            <LiquidText
              words={[
                "business",
                "pharmacy",
                "fashion label",
                "music studio",
                "salon",
                "consultancy",
              ]}
            />
            .
          </>
        }
        lede="One workspace. Eight modules. Naira-native, mobile-first, ready to sell on day one."
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/onboarding/create-account" variant="primary" size="lg">
            Start free trial
            <ArrowRight size={18} />
          </Button>
          <Button href="/product" variant="secondary-dark" size="lg">
            See features
          </Button>
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
          14-day free trial · No credit card
        </p>
      </HeroGeometric>

      <AnimatedBento />

      {/* Chapter 1 — Website. Anchor photo: an owner on her phone running her
          business from a Lagos shop. Real people, not lifestyle stock. */}
      <StickyScrollChapter
        imgUrl="/people/owner-phone.jpg"
        subheading="Chapter 1 · Storefront"
        heading={<>Your website, live in <span className="text-primary-light">minutes</span>.</>}
      />

      {/* Chapter 2 — Operations. */}
      <StickyScrollChapter
        imgUrl="/people/owner-shop.jpg"
        subheading="Chapter 2 · Operations"
        heading={<>Every order, every customer, in one inbox.</>}
      />

      {/* Chapter 3 — Marketing. */}
      <StickyScrollChapter
        imgUrl="/people/owner-man-1.jpg"
        subheading="Chapter 3 · Marketing"
        heading={<>Turn one-time buyers into <span className="text-primary-light">regulars</span>.</>}
      />

      <FinalCTA />
    </MarketingShell>
  );
}
