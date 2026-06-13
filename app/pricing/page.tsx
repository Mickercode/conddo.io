import type { Metadata } from "next";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { CinematicPricing } from "@/components/marketing/cinematic/CinematicPricing";
import { ComparePlans } from "@/components/marketing/cinematic/ComparePlans";
import { CinematicFAQ } from "@/components/marketing/cinematic/CinematicFAQ";
import { CinematicFinalCTA } from "@/components/marketing/cinematic/CinematicFinalCTA";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "Pricing — Conddo.io",
  description:
    "Simple pricing, built to grow with your business. Start free. Upgrade when you're ready. No contracts. No hidden fees.",
};

/** /pricing — cinematic redesign on the new copy ladder. UX:
 *
 *    Hero (PRICING)
 *    CinematicPricing      Monthly/Quarterly toggle + 3 plan cards
 *                          (Launcher, Growth, Scaler). Growth marked
 *                          as Most Popular.
 *    ComparePlans          Feature matrix grouped into Core / Growth
 *                          / Scale tiers.
 *    CinematicFAQ          Five accordion questions from the brief.
 *    CinematicFinalCTA     "Run your business from one platform."
 */
export default function PricingPage() {
  return (
    <MarketingShell>
      <HeroGeometric
        eyebrow="Pricing"
        titleTop="Simple pricing."
        titleBottom={
          <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
            Built to grow with your business.
          </span>
        }
        lede={
          <>
            <p>Start free. Upgrade when you&apos;re ready.</p>
            <p className="text-white/45">No contracts. No hidden fees.</p>
          </>
        }
      />

      <CinematicPricing />
      <ComparePlans />
      <CinematicFAQ />
      <CinematicFinalCTA />
    </MarketingShell>
  );
}
