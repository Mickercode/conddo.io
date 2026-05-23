import { ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";
import { DashboardPreview } from "./mocks/DashboardPreview";

export function Hero() {
  return (
    <section id="top" className="bg-ink">
      <div className="container-x pb-16 pt-16 md:pb-24 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-primary-light">
            Sell more · Stress less
          </span>

          <h1 className="text-balance text-[42px] font-medium leading-[1.05] tracking-[-0.02em] text-white md:text-[64px]">
            Everything your business needs to sell, operate, and grow.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/70">
            Your website. Your customers. Your orders. Your marketing. One
            platform, built for your type of business.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/onboarding/create-account" variant="primary" size="lg">
              Start free trial
              <ArrowRight size={18} />
            </Button>
            <Button href="#features" variant="secondary-dark" size="lg">
              See features
            </Button>
          </div>

          <p className="mt-5 font-mono text-[12px] text-white/40">
            14-day free trial · No credit card required
          </p>
        </div>

        {/* Product preview — the white card lifts off the dark purely through
            tonal contrast, no shadow (per the brand's flat-plus approach). */}
        <div className="mx-auto mt-14 max-w-4xl md:mt-16">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
