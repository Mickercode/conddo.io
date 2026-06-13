"use client";

import { motion } from "framer-motion";

/** Trust strip — the thin band that sits directly below the hero, three
 *  short phrases separated by dots. Reads as the rhythm transition
 *  between hero and the long-form sections.
 *
 *  Stays on the same dark surface so the page reads as one continuous
 *  cinematic flow, not a hero pasted on top of a different document. */
export function TrustStrip() {
  const phrases = [
    "One platform",
    "One source of truth",
    "Built to scale with your business",
  ];
  return (
    <div className="bg-[#0a0a0c] border-t border-b border-white/[0.06]">
      <div className="container-x py-7 md:py-8">
        <motion.ul
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-x-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {phrases.map((p, i) => (
            <li key={p} className="inline-flex items-center gap-4 md:gap-6">
              {i > 0 && (
                <span
                  aria-hidden
                  className="h-1 w-1 rounded-full bg-primary-light/40"
                />
              )}
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/55">
                {p}
              </span>
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}
