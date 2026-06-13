"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Closing CTA — sits on the dark cinematic surface so the home page
 *  doesn't lurch back to a violet brand block at the bottom. Big
 *  closing headline, supporting copy, single primary CTA, and the
 *  trial-terms microcopy. */
export function CinematicFinalCTA() {
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      {/* Soft radial highlight behind the headline — same family as the
          hero but at the bottom, so the page closes the way it opened. */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.05] via-transparent to-transparent pointer-events-none" />
      <div className="marketing-hero-dark-grid absolute inset-0 opacity-40 pointer-events-none" aria-hidden />

      <div className="relative container-x py-28 md:py-40">
        <div className="max-w-3xl mx-auto text-center">
          <motion.span
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-light backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles size={11} className="text-primary-light" />
            Ready when you are
          </motion.span>

          <motion.h2
            className="text-balance text-5xl md:text-7xl font-semibold tracking-[-0.02em] text-white leading-[1.02]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Run your business with{" "}
            <span className="bg-gradient-to-r from-primary-light via-rose-300 to-amber-200 bg-clip-text text-transparent">
              clarity
            </span>
            .
          </motion.h2>

          <motion.p
            className="mt-7 text-pretty text-lg md:text-xl text-white/65 leading-relaxed font-light max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Join businesses using Conddo to simplify operations, improve efficiency, and unlock sustainable growth.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
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
            transition={{ delay: 0.4 }}
          >
            14-day free trial · No credit card required
          </motion.p>
        </div>
      </div>
    </section>
  );
}
