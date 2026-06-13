import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { ProofBar } from "@/components/ProofBar";
import { HomeBento } from "@/components/marketing/HomeBento";
import { BusinessTypes } from "@/components/BusinessTypes";
import { SocialProof } from "@/components/SocialProof";
import { FinalCTA } from "@/components/FinalCTA";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Conddo.io — Sell more. Stress less.",
  description:
    "Everything your business needs to sell, operate, and grow. Your website, customers, orders, and marketing — one platform, built for your type of business.",
  openGraph: {
    title: "Conddo.io — Sell more. Stress less.",
    description:
      "Everything your business needs to sell, operate, and grow. One platform, built for your type of business.",
    type: "website",
  },
};

/** Home page — the high-level overview. Dark hero with product mockup,
 *  then a bento grid teaser of every module, a slimmed BusinessTypes
 *  glance (full version lives on /businesses), trust strip, and a closing
 *  CTA. Deep features live on /product; pricing on /pricing; etc. */
export default function Home() {
  return (
    <MarketingShell>
      <Hero />
      <ProofBar />
      <Reveal><HomeBento /></Reveal>
      <Reveal><BusinessTypes /></Reveal>
      <Reveal><SocialProof /></Reveal>
      <FinalCTA />
    </MarketingShell>
  );
}
