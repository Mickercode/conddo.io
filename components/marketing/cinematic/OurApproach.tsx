"use client";

import { motion } from "framer-motion";
import { Target, Wrench, GitBranch, Sparkles, type LucideIcon } from "lucide-react";

/** "Our Approach" — four cards in a 2×2 grid (responsive). Each card is
 *  a principle that maps to one of Conddo's values: Focused, Practical,
 *  Flexible, Accessible. */
type Principle = { icon: LucideIcon; label: string; description: string };

const principles: Principle[] = [
  {
    icon: Target,
    label: "Focused",
    description:
      "We build software that solves real operational problems — not software packed with features nobody uses.",
  },
  {
    icon: Wrench,
    label: "Practical",
    description:
      "Every tool should save time, reduce complexity, or improve decision-making.",
  },
  {
    icon: GitBranch,
    label: "Flexible",
    description:
      "Businesses evolve. Your software should evolve with you.",
  },
  {
    icon: Sparkles,
    label: "Accessible",
    description:
      "Powerful business software should be easy to adopt, easy to understand, and easy to use.",
  },
];

export function OurApproach() {
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-36">
        <div className="max-w-3xl mb-14 md:mb-20">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Our approach
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Four principles. <span className="text-primary-light">One product.</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
          {principles.map((p, i) => (
            <motion.div
              key={p.label}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 md:p-9 backdrop-blur transition-colors hover:border-primary/30"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary-light border border-primary/20 group-hover:bg-primary/15 transition-colors">
                <p.icon size={22} strokeWidth={1.5} />
              </span>
              <p className="mt-6 text-[20px] md:text-[22px] font-semibold text-white leading-snug tracking-[-0.01em]">
                {p.label}
              </p>
              <p className="mt-3 text-pretty text-[15px] text-white/60 leading-relaxed font-light">
                {p.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
