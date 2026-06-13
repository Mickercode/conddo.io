import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { TrustStrip } from "@/components/marketing/cinematic/TrustStrip";
import { ProblemSection } from "@/components/marketing/cinematic/ProblemSection";
import { AnimatedBento } from "@/components/marketing/cinematic/AnimatedBento";
import { DifferentiatorSection } from "@/components/marketing/cinematic/DifferentiatorSection";
import { FlexibilitySection } from "@/components/marketing/cinematic/FlexibilitySection";
import { TeamSection } from "@/components/marketing/cinematic/TeamSection";
import { TrustSection } from "@/components/marketing/cinematic/TrustSection";
import { CinematicFinalCTA } from "@/components/marketing/cinematic/CinematicFinalCTA";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Conddo.io — The Operating System for Modern Businesses",
  description:
    "Run your business from one platform. Manage customers, orders, payments, inventory, bookings, marketing, and team operations in one connected workspace.",
  openGraph: {
    title: "Conddo.io — The Operating System for Modern Businesses",
    description:
      "Replace spreadsheets, disconnected tools, and manual processes with a system designed to help your business operate efficiently and grow with confidence.",
    type: "website",
  },
};

/** Cinematic home — the eight-section operations-positioning narrative.
 *
 *   1. Hero               — positioning ("Run your business from one platform")
 *   2. Trust strip        — three-phrase rhythm transition
 *   3. ProblemSection     — fragmented-state recognition
 *   4. AnimatedBento      — 8 modules (Solution + Capabilities)
 *   5. DifferentiatorSection — "Everything works together" + connectivity diagram
 *   6. FlexibilitySection — industry adaptability (4 archetypes)
 *   7. TeamSection        — collaboration + role-based access
 *   8. TrustSection       — testimonials
 *   9. CinematicFinalCTA  — closing conversion strip
 *
 *  Every section sits on the same #0a0a0c surface so the page reads as
 *  one continuous cinematic flow rather than a strip-mall of sections. */
export default function Home() {
  return (
    <MarketingShell>
      <HeroGeometric
        eyebrow="The operating system for modern businesses"
        titleTop="Run your business"
        titleBottom={
          <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
            from one platform.
          </span>
        }
        lede={
          <>
            <p>
              Manage customers, orders, payments, inventory, bookings, marketing, and team operations in one connected workspace.
            </p>
            <p className="text-white/45">
              Replace spreadsheets, disconnected tools, and manual processes with a system designed to help your business operate efficiently and grow with confidence.
            </p>
          </>
        }
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/onboarding/create-account" variant="primary" size="lg">
            Start free trial
            <ArrowRight size={18} />
          </Button>
          <Button href="/product" variant="secondary-dark" size="lg">
            Explore product
          </Button>
        </div>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-white/35">
          14-day free trial · No credit card required
        </p>
      </HeroGeometric>

      <TrustStrip />
      <ProblemSection />
      <AnimatedBento />
      <DifferentiatorSection />
      <FlexibilitySection />
      <TeamSection />
      <TrustSection />
      <CinematicFinalCTA />
    </MarketingShell>
  );
}
