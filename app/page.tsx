import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { ProofBar } from "@/components/ProofBar";
import { Features } from "@/components/Features";
import { BusinessTypes } from "@/components/BusinessTypes";
import { Pricing } from "@/components/Pricing";
import { SocialProof } from "@/components/SocialProof";
import { FAQ } from "@/components/FAQ";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";

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
            section → off-white → violet CTA strip → dark footer. Never two
            darks or two purples back to back. */}
        <Hero />
        <ProofBar />
        <Features />
        <BusinessTypes />
        <Pricing />
        <SocialProof />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
