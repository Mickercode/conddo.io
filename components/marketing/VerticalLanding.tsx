import { ArrowRight, Sparkles, type LucideIcon } from "lucide-react";
import { MarketingShell } from "./MarketingShell";
import { SectionHeader } from "./SectionHeader";
import { BentoGrid, BentoCard } from "./BentoGrid";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FinalCTA } from "@/components/FinalCTA";
import { Reveal } from "@/components/ui/Reveal";

/** Reusable vertical landing template. Each vertical (pharmacy / fashion /
 *  music studio / …) renders this with their own copy and module list. Keeps
 *  every vertical landing visually and structurally identical so the user
 *  can compare them at a glance. */
export type VerticalSpec = {
  slug: string;
  /** Eyebrow chip text — e.g. "Conddo for Pharmacy". */
  eyebrow: string;
  /** Main hero headline. */
  headline: string;
  /** Hero sub-paragraph. */
  lede: string;
  /** Per-vertical CTA query so signup auto-routes them. */
  signupHref: string;
  /** Featured modules — what this vertical gets in addition to core. */
  modules: { icon: LucideIcon; eyebrow: string; title: string; description: string }[];
  /** Day-in-the-life scenario — concrete user story to make the offer
   *  tangible. */
  scenario: {
    title: string;
    paragraphs: string[];
  };
  /** Stat tiles for the proof strip. */
  stats: { label: string; value: string }[];
};

export function VerticalLanding({ spec }: { spec: VerticalSpec }) {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="marketing-hero-dark relative overflow-hidden">
        <div className="marketing-hero-dark-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-primary-light backdrop-blur">
              <Sparkles size={11} className="text-primary-light" />
              {spec.eyebrow}
            </span>
            <h1 className="text-balance text-[42px] font-medium leading-[1.05] tracking-[-0.02em] text-white md:text-[56px]">
              {spec.headline}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[17px] leading-relaxed text-white/70">
              {spec.lede}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href={spec.signupHref} variant="primary" size="lg">
                Start free trial <ArrowRight size={18} />
              </Button>
              <Button href="/product" variant="secondary-dark" size="lg">
                See all features
              </Button>
            </div>
          </div>

          {/* Stat strip — quick proof inline in the hero. */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            {spec.stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center backdrop-blur"
              >
                <p className="font-mono text-[22px] font-medium leading-none text-white md:text-[26px]">{s.value}</p>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules — vertical-specific bento. */}
      <section className="bg-neutral-bg py-20 md:py-28">
        <div className="container-x">
          <SectionHeader
            eyebrow="Modules"
            title={<>What's turned on for this vertical, <span className="text-primary">out of the box</span>.</>}
            lede="Beyond the core Conddo modules every business gets, these are the specialised tools shipped for your industry."
          />
          <BentoGrid>
            {spec.modules.map((m, i) => (
              <BentoCard
                key={m.title}
                // Alternate between 3-col and 2-col cards so the grid breathes.
                span={i % 3 === 0 ? "lg" : "sm"}
                icon={m.icon}
                eyebrow={m.eyebrow}
                title={m.title}
                description={m.description}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Day-in-the-life scenario — concrete story to make the offer
          tangible. Long-form paragraph block, narrow column for readability. */}
      <section className="bg-neutral-surface py-20 md:py-28">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl">
              <SectionHeader
                eyebrow="A day on Conddo"
                title={spec.scenario.title}
                align="center"
              />
              <div className="space-y-5 text-[16px] leading-[1.75] text-content-secondary">
                {spec.scenario.paragraphs.map((p, i) => (
                  <p key={i} className="text-pretty">{p}</p>
                ))}
              </div>
              <div className="mt-9 flex flex-wrap justify-center gap-2">
                <Chip tone="primary">Naira-native</Chip>
                <Chip tone="primary">Mobile-first</Chip>
                <Chip tone="primary">Built for SMEs</Chip>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </MarketingShell>
  );
}
