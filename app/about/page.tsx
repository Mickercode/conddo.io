import type { Metadata } from "next";
import { HeroGeometric } from "@/components/marketing/cinematic/HeroGeometric";
import { WhyWeExist } from "@/components/marketing/cinematic/WhyWeExist";
import { WhatWeBelieve } from "@/components/marketing/cinematic/WhatWeBelieve";
import { OurApproach } from "@/components/marketing/cinematic/OurApproach";
import { FutureVision } from "@/components/marketing/cinematic/FutureVision";
import { AboutFinalCTA } from "@/components/marketing/cinematic/AboutFinalCTA";
import { MarketingShell } from "@/components/marketing/MarketingShell";

export const metadata: Metadata = {
  title: "About — Conddo.io",
  description:
    "Building the operating system for modern businesses. One platform for customers, payments, operations, and growth.",
};

/** /about — the company story. UX:
 *
 *    Hero                "Building the operating system for modern businesses"
 *    WhyWeExist          Five-systems frustration + triplet close
 *    WhatWeBelieve       Software adapts to business / not the other way
 *                        around + industry contrasts
 *    OurApproach         Four principle cards (Focused / Practical /
 *                        Flexible / Accessible)
 *    FutureVision        Generational shift framing + the triplet
 *                        (Connected / Data-driven / Efficient)
 *    AboutFinalCTA       Five-noun stack landing on "Connected." with
 *                        gradient flourish + trial CTA
 */
export default function AboutPage() {
  return (
    <MarketingShell>
      <HeroGeometric
        eyebrow="About Conddo"
        titleTop="Building the"
        titleBottom={
          <span className="bg-gradient-to-r from-primary-light via-white/95 to-rose-300 bg-clip-text text-transparent">
            operating system for modern businesses.
          </span>
        }
        lede={
          <>
            <p>
              Businesses today run on a patchwork of tools, spreadsheets, messages, and manual processes.
            </p>
            <p className="text-white/45">
              We think there is a better way.
            </p>
            <p>
              Conddo brings customers, payments, operations, and growth into one connected platform — giving businesses the clarity and control they need to grow.
            </p>
          </>
        }
      />

      <WhyWeExist />
      <WhatWeBelieve />
      <OurApproach />
      <FutureVision />
      <AboutFinalCTA />
    </MarketingShell>
  );
}
