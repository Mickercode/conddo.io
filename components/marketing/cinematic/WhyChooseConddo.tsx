"use client";

import { motion } from "framer-motion";

/** "Why businesses choose Conddo" section for /product. Centred on the
 *  one-system-vs-many narrative with a 4-line outcome stack at the end. */
export function WhyChooseConddo() {
  const outcomes = [
    "Less administration.",
    "Better visibility.",
    "Faster decision-making.",
    "Stronger operations.",
  ];

  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.03] to-transparent pointer-events-none" />

      <div className="relative container-x py-24 md:py-36">
        <div className="max-w-3xl">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why businesses choose Conddo
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            One system <span className="text-primary-light">instead of</span> many.
          </motion.h2>
          <motion.p
            className="mt-6 text-pretty text-lg md:text-xl text-white/55 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Most businesses rely on disconnected software that creates duplicate work and fragmented information.
          </motion.p>
          <motion.p
            className="mt-4 text-pretty text-lg md:text-xl text-white/75 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Conddo replaces complexity with a unified platform where every part of your business works together.
          </motion.p>
        </div>

        <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl">
          {outcomes.map((o, i) => (
            <motion.div
              key={o}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.6 }}
              whileHover={{ y: -3, borderColor: "rgba(160,127,212,0.3)" }}
            >
              <p className="text-[17px] md:text-[18px] font-medium text-white leading-snug">{o}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
