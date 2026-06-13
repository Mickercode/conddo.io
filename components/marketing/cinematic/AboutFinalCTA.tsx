"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Custom CTA for /about — the closing copy is a five-noun stack
 *  ("Customers / Orders / Payments / Operations / Growth") that lands
 *  on "Connected." with a gradient flourish. Tighter than the standard
 *  CinematicFinalCTA; uses verbs as visual rhythm instead of a long
 *  prose CTA. */
export function AboutFinalCTA() {
  const nouns = ["Customers.", "Orders.", "Payments.", "Operations.", "Growth."];
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.06] via-transparent to-transparent pointer-events-none" />
      <div className="marketing-hero-dark-grid absolute inset-0 opacity-40 pointer-events-none" aria-hidden />

      <div className="relative container-x py-28 md:py-40">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Run your business from one platform
          </motion.p>

          {/* Five nouns, vertical stack. Stagger each in. */}
          <div className="space-y-1.5 md:space-y-2">
            {nouns.map((n, i) => (
              <motion.p
                key={n}
                className="text-pretty text-5xl md:text-7xl font-semibold tracking-[-0.02em] text-white/85 leading-none"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.6,
                  delay: 0.1 + i * 0.08,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
              >
                {n}
              </motion.p>
            ))}
          </div>

          {/* Close — "Connected." gets the gradient + a longer entrance. */}
          <motion.p
            className="mt-3 text-pretty text-5xl md:text-7xl font-semibold tracking-[-0.02em] leading-none"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.8,
              delay: 0.6,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
          >
            <span className="bg-gradient-to-r from-primary-light via-rose-300 to-amber-200 bg-clip-text text-transparent">
              Connected.
            </span>
          </motion.p>

          <motion.div
            className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <Button href="/onboarding/create-account" variant="primary" size="lg">
              Start free trial
              <ArrowRight size={18} />
            </Button>
          </motion.div>

          <motion.p
            className="mt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-white/35"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
          >
            14-day free trial · No credit card required
          </motion.p>
        </div>
      </div>
    </section>
  );
}
