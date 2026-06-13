"use client";

import { motion } from "framer-motion";

/** "Why We Exist" — narrative section for /about. Opens with the
 *  five-systems frustration, transitions through "The result is
 *  complexity", lands on the simplification mission, then closes
 *  with a triplet staircase. */
export function WhyWeExist() {
  const triplet = [
    "One platform.",
    "One source of truth.",
    "One place to run your business.",
  ];
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-36">
        <div className="max-w-3xl">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why we exist
          </motion.p>

          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Running a business shouldn&apos;t require <span className="text-primary-light">juggling</span> five different systems.
          </motion.h2>

          <motion.p
            className="mt-8 text-pretty text-lg md:text-xl text-white/65 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Yet many businesses manage customers in one place, payments in another, inventory somewhere else, and reporting in spreadsheets.
          </motion.p>

          <motion.p
            className="mt-6 text-pretty text-xl md:text-3xl font-medium text-white/85 leading-snug"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            The result is <span className="text-primary-light">complexity</span>.
          </motion.p>

          <motion.p
            className="mt-12 text-pretty text-lg md:text-xl text-white/65 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Conddo was built to simplify the way businesses operate.
          </motion.p>
        </div>

        {/* Triplet staircase — close. */}
        <div className="mt-14 md:mt-20 max-w-3xl space-y-3 md:space-y-4">
          {triplet.map((line, i) => (
            <motion.p
              key={line}
              className="text-pretty text-2xl md:text-4xl font-medium text-white leading-snug"
              style={{ paddingLeft: `${i * 1.25}rem` }}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.6,
                delay: 0.15 + i * 0.12,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
