import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ProofBar } from "@/components/ProofBar";
import { Features } from "@/components/Features";
import { RealBusinesses } from "@/components/RealBusinesses";
import { BusinessTypes } from "@/components/BusinessTypes";
import { Pricing } from "@/components/Pricing";
import { SocialProof } from "@/components/SocialProof";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
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

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* Section sequence: dark hero → off-white content → one light-purple
            section → off-white → violet CTA strip → dark footer. Below-the-fold
            sections fade-and-rise into view via <Reveal>. */}
        <Hero />
        <ProofBar />
        <Reveal><Features /></Reveal>
        <Reveal><RealBusinesses /></Reveal>
        <Reveal><BusinessTypes /></Reveal>
        <Reveal><Pricing /></Reveal>
        <Reveal><SocialProof /></Reveal>
        <Reveal><FAQ /></Reveal>
        <Reveal><FinalCTA /></Reveal>
      </main>
      <Footer />
    </>
  );
}
