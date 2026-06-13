"use client";

import { motion } from "framer-motion";

/** "Grow without switching platforms" section — short narrative block
 *  about scaling. The four "Add X" lines stagger in like a staircase
 *  building up to "Conddo scales with your business" as the close. */
export function GrowWithoutSwitching() {
  const additions = [
    "Add locations.",
    "Add staff.",
    "Add services.",
    "Add customers.",
  ];
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      {/* Soft glow on the right side so the staircase has something to
          climb toward visually. */}
      <div className="absolute inset-0 bg-[radial-gradient(40%_60%_at_85%_50%,rgba(160,127,212,0.06),transparent_70%)] pointer-events-none" />

      <div className="relative container-x py-24 md:py-36">
        <div className="max-w-3xl">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Grow without switching platforms
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Start simple.
          </motion.h2>
        </div>

        {/* Staircase — each line is indented further than the last so the
            visual rhythm matches the "adding things over time" narrative. */}
        <div className="mt-14 md:mt-20 space-y-3 md:space-y-4">
          {additions.map((line, i) => (
            <motion.p
              key={line}
              className="text-pretty text-2xl md:text-4xl font-light text-white/75 leading-snug"
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

        <motion.p
          className="mt-14 md:mt-20 text-pretty text-2xl md:text-4xl font-medium leading-snug text-white max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Conddo <span className="text-primary-light">scales</span> with your business.
        </motion.p>
      </div>
    </section>
  );
}
