import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import { Section, Eyebrow } from "./ui/Section";
import { Button } from "./ui/Button";

const points = [
  "Set up for your industry from day one",
  "Accept Naira payments — no dollar card needed",
  "One subscription instead of juggling five tools",
];

export function RealBusinesses() {
  return (
    <Section tone="surface" className="border-y border-neutral-border">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Photo collage — main portrait + a smaller overlapping shot */}
        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-neutral-border">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src="/people/owner-phone.jpg"
                alt="A business owner running her shop on Conddo.io"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="absolute -bottom-6 left-6 hidden w-44 overflow-hidden rounded-xl border-4 border-neutral-surface sm:block">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/people/owner-shop.jpg"
                alt="A proud shop owner outside her store"
                fill
                sizes="176px"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Copy */}
        <div>
          <Eyebrow>Real businesses</Eyebrow>
          <h2 className="text-[32px] leading-tight tracking-[-0.01em] md:text-[40px]">
            Built for how Nigerian businesses actually run.
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-[1.7] text-content-secondary">
            From a tailor in Surulere to a pharmacy in Enugu, Conddo gives every
            business the same professional setup — website, payments, customers,
            and marketing — tuned to their trade.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-2.5">
                <Check size={18} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.5} />
                <span className="text-[15px] text-content-secondary">{p}</span>
              </li>
            ))}
          </ul>
          <Button href="/onboarding/create-account" variant="primary" size="lg" className="mt-8">
            Start free trial
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </Section>
  );
}
