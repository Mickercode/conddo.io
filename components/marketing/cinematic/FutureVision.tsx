"use client";

import { motion } from "framer-motion";

/** "The Future We're Building" — vision statement. Opens on the
 *  generational shift framing, lands the triplet (More connected /
 *  More data-driven / More efficient) as the rhetorical close, then
 *  states the mission. */
export function FutureVision() {
  const triplet = [
    { label: "More connected." },
    { label: "More data-driven." },
    { label: "More efficient." },
  ];

  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      {/* Soft glow on the right so the section has light to climb toward
          as the user scrolls. */}
      <div className="absolute inset-0 bg-[radial-gradient(50%_70%_at_80%_50%,rgba(160,127,212,0.07),transparent_70%)] pointer-events-none" />

      <div className="relative container-x py-24 md:py-36">
        <div className="max-w-3xl">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            The future we&apos;re building
          </motion.p>

          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            The next generation of businesses will run differently.
          </motion.h2>
        </div>

        {/* Triplet — three glass tiles, equal weight. */}
        <div className="mt-14 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl">
          {triplet.map((t, i) => (
            <motion.div
              key={t.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4, borderColor: "rgba(160,127,212,0.3)" }}
            >
              <p className="text-[22px] md:text-[26px] font-semibold text-white leading-tight tracking-[-0.01em]">
                {t.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 md:mt-20 max-w-3xl">
          <motion.p
            className="text-pretty text-lg md:text-2xl font-light text-white/75 leading-snug"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            The businesses that grow fastest will be the ones with{" "}
            <span className="text-primary-light">visibility into every part</span> of their operations.
          </motion.p>
          <motion.p
            className="mt-4 text-pretty text-lg md:text-xl text-white/85 leading-relaxed font-medium"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Our mission is to provide the infrastructure that makes that possible.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
