"use client";

import { motion } from "framer-motion";

/** "How Conddo Works" section — sits directly under the product hero. Lays
 *  out the connectivity narrative as a 5-line stack with each line revealing
 *  on scroll. No diagram here (that's the next section); this is pure
 *  rhetoric, just slightly more visual than a paragraph. */
export function HowConddoWorks() {
  const lines = [
    "Customers connect to orders.",
    "Orders connect to payments.",
    "Payments connect to reporting.",
    "Inventory updates automatically.",
    "Marketing runs on real customer activity.",
  ];
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-32">
        <div className="max-w-3xl">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            How Conddo Works
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white/85 leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Most business software solves a single problem.
          </motion.h2>
          <motion.h2
            className="mt-4 text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Conddo connects <span className="text-primary-light">every part</span> of your business.
          </motion.h2>
        </div>

        <div className="mt-14 md:mt-20 border-l border-white/10 pl-6 md:pl-8 space-y-4 max-w-2xl">
          {lines.map((l, i) => (
            <motion.p
              key={l}
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
              {l}
            </motion.p>
          ))}
        </div>

        <motion.p
          className="mt-14 md:mt-20 text-pretty text-xl md:text-2xl font-light leading-snug text-white/85 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Everything stays connected, giving your team a{" "}
          <span className="text-primary-light">single source of truth</span>.
        </motion.p>
      </div>
    </section>
  );
}
