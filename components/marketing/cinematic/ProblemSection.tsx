"use client";

import { motion } from "framer-motion";

/** Problem section — narrative-driven dark block that makes the visitor
 *  feel understood. Two-tier headline + a fragmented-state list that
 *  staggers in as you scroll, then a transition line into the solution.
 *
 *  Lives on the home page between hero+bento and the differentiator. No
 *  CTAs — the goal is recognition, not conversion. */
export function ProblemSection() {
  const fragments = [
    "Customer records are scattered across tools.",
    "Payments are tracked manually.",
    "Inventory lives in spreadsheets.",
    "Appointments happen through messages and calls.",
    "Reports take hours to prepare.",
  ];

  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      {/* Subtle radial gradient for visual depth — same family as the hero
          but quieter so it doesn't compete with the copy. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="relative container-x py-24 md:py-36">
        <div className="max-w-3xl mx-auto">
          {/* Two-tier headline — the contrast between "growth" and
              "operations" carries the whole rhetorical move. */}
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white/90 leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Most businesses don&apos;t have a{" "}
            <span className="text-white/40">growth</span> problem.
          </motion.h2>
          <motion.h2
            className="mt-4 text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.1]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            They have an{" "}
            <span className="bg-gradient-to-r from-primary-light via-rose-300 to-amber-200 bg-clip-text text-transparent">
              operations
            </span>{" "}
            problem.
          </motion.h2>

          {/* Fragmented-state list — each line staggers in to reinforce the
              "things piling up" sense. Vertical bar on the left ties them
              together as a single thought block. */}
          <div className="mt-14 md:mt-20 border-l border-white/10 pl-6 md:pl-8 space-y-4">
            {fragments.map((f, i) => (
              <motion.p
                key={f}
                className="text-pretty text-lg md:text-2xl text-white/70 font-light leading-relaxed"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {f}
              </motion.p>
            ))}
          </div>

          {/* Resolution lines — the close. */}
          <motion.p
            className="mt-14 md:mt-20 text-pretty text-xl md:text-3xl font-light leading-snug text-white/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            As businesses grow, complexity grows with them.
          </motion.p>
          <motion.p
            className="mt-6 text-pretty text-xl md:text-3xl font-medium leading-snug text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            Conddo brings everything together so your business can operate with{" "}
            <span className="text-primary-light">clarity</span>,{" "}
            <span className="text-primary-light">consistency</span>, and{" "}
            <span className="text-primary-light">control</span>.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
