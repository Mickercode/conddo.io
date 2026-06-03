import { ArrowRight } from "lucide-react";
import { Button } from "./ui/Button";
import { RotatingWord } from "./ui/RotatingWord";
import { HeroPreview } from "./mocks/HeroPreview";

export function Hero() {
  return (
    <section id="top" className="bg-ink">
      {/* Copy block — compact, lets the preview do the heavy lifting below. */}
      <div className="container-x pt-16 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-primary-light">
            Sell more · Stress less
          </span>

          <h1 className="text-balance text-[42px] font-medium leading-[1.05] tracking-[-0.02em] text-white md:text-[64px]">
            Everything your{" "}
            <RotatingWord
              words={["business", "pharmacy", "fashion brand", "restaurant", "salon", "consultancy"]}
              className="text-primary-light"
            />{" "}
            needs to sell, operate, and grow.
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
      </div>

      {/* Product preview — full container width, auto-rotates through 5 tabs so
          a visitor sees "this is a real working product" before they scroll.
          The white card sits inside a soft shadow so it reads as foreground
          floating above the dark hero. Pause-on-hover + reduced-motion handled
          inside HeroPreview. */}
      <div className="container-x pb-20 pt-12 md:pb-28 md:pt-16">
        <div className="mx-auto max-w-5xl">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}
