import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { IndustryCards } from "@/components/marketing/cinematic/IndustryCards";
import { SpecializedWorkflows } from "@/components/marketing/cinematic/SpecializedWorkflows";
import { GrowWithoutSwitching } from "@/components/marketing/cinematic/GrowWithoutSwitching";
import { CinematicFinalCTA } from "@/components/marketing/cinematic/CinematicFinalCTA";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Solutions — Conddo.io",
  description:
    "One platform, adapted to your business. Conddo brings customers, orders, payments, inventory, and operations together with workflows designed for the way your business works.",
};

/** /businesses — the Solutions page. UX structure:
 *
 *    Hero (BUSINESS SOLUTIONS)
 *    IndustryCards          — six supported industries
 *    SpecializedWorkflows   — six vertical workflow tiles (3 live, 3 soon)
 *    GrowWithoutSwitching   — scaling narrative
 *    CinematicFinalCTA
 *
 *  The three live workflow tiles deep-link into the existing vertical
 *  landings (/businesses/pharmacy, /businesses/fashion, /businesses/
 *  music-studio); those landings keep their previous content until the
 *  cinematic propagation reaches them. */
export default function BusinessesPage() {
  return (
    <MarketingShell>
      <HeroGeometric
        eyebrow="Business Solutions"
        titleTop="One platform."
        titleBottom={
          <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
            Adapted to your business.
          </span>
        }
        lede={
          <p>
            Conddo brings customers, orders, payments, inventory, and operations together in one system — with workflows designed for the way your business works.
          </p>
        }
      >
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/onboarding/create-account" variant="primary" size="lg">
            Get started
            <ArrowRight size={18} />
          </Button>
        </div>
      </HeroGeometric>

      <IndustryCards />
      <SpecializedWorkflows />
      <GrowWithoutSwitching />
      <CinematicFinalCTA />
    </MarketingShell>
  );
}
