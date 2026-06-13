"use client";

import { motion } from "framer-motion";

/** "What We Believe" — narrative section for /about. Two-tier headline
 *  (software adapts to the business / not the other way around), two
 *  contrasting industry examples, and the close on Conddo's reflection
 *  of those realities. */
export function WhatWeBelieve() {
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      {/* Soft radial highlight on the left so this section feels distinct
          from the surrounding dark blocks. */}
      <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_20%_50%,rgba(160,127,212,0.06),transparent_70%)] pointer-events-none" />

      <div className="relative container-x py-24 md:py-36">
        <div className="max-w-3xl">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            What we believe
          </motion.p>

          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white/85 leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Software should adapt to the business.
          </motion.h2>
          <motion.h2
            className="mt-4 text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Not <span className="text-primary-light">the other way around</span>.
          </motion.h2>

          <motion.p
            className="mt-12 text-pretty text-xl md:text-2xl font-medium text-white/85 leading-snug"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Businesses are different.
          </motion.p>
        </div>

        {/* Two contrasting comparison lines — each one a pair. */}
        <div className="mt-10 md:mt-14 max-w-3xl border-l border-white/10 pl-6 md:pl-8 space-y-4">
          {[
            "A retailer operates differently from a consultancy.",
            "A healthcare provider operates differently from a logistics company.",
          ].map((line, i) => (
            <motion.p
              key={line}
              className="text-pretty text-lg md:text-2xl text-white/70 font-light leading-snug"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.6,
                delay: 0.1 + i * 0.12,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              {line}
            </motion.p>
          ))}
        </div>

        <div className="max-w-3xl mt-12 md:mt-16">
          <motion.p
            className="text-pretty text-lg md:text-xl text-white/65 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Technology should reflect those realities.
          </motion.p>
          <motion.p
            className="mt-4 text-pretty text-lg md:text-xl text-white/85 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            That&apos;s why Conddo combines a unified platform with workflows designed around how businesses actually work.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
