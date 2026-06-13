"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

/** Reusable module deep-dive section for the /product page. Each module
 *  gets one of these: eyebrow + headline + paragraph + outcome bullets +
 *  large visual. Layout alternates left/right depending on the `reverse`
 *  prop so the page reads with rhythm across eight sections instead of
 *  feeling stamped from a template.
 *
 *  Visual on desktop sits in its own column at ~3:2 ratio against the
 *  copy column; on mobile the visual stacks above the copy. */
export function ModuleDeepSection({
  anchor,
  eyebrow,
  title,
  description,
  outcomes,
  visual,
  reverse = false,
}: {
  /** id for in-page deep linking from the home bento or other pages. */
  anchor: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  outcomes: string[];
  visual: ReactNode;
  reverse?: boolean;
}) {
  return (
    <section
      id={anchor}
      className="scroll-mt-24 relative bg-[#0a0a0c] overflow-hidden"
    >
      <div className="container-x py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-10 lg:gap-16 items-center">
          {/* Copy column */}
          <motion.div
            className={reverse ? "lg:order-2" : ""}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary-light mb-5">
              {eyebrow}
            </p>
            <h2 className="text-balance text-[36px] md:text-[48px] font-semibold tracking-[-0.02em] text-white leading-[1.05]">
              {title}
            </h2>
            <p className="mt-5 text-pretty text-[16px] md:text-[17px] text-white/60 leading-relaxed font-light max-w-md">
              {description}
            </p>
            <ul className="mt-7 space-y-2.5">
              {outcomes.map((o) => (
                <li key={o} className="flex items-start gap-3 text-[14.5px] text-white/85">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-light" />
                  {o}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Visual column — a deep panel that gives the live animation
              real breathing room. Same #13131a as the bento cells so the
              two surfaces feel related but the deep section reads as the
              "big" view. */}
          <motion.div
            className={`${reverse ? "lg:order-1" : ""} relative rounded-3xl border border-white/[0.08] bg-[#13131a] p-8 md:p-12 aspect-[5/4] overflow-hidden`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Soft violet glow behind the visual so it doesn't sit on flat
                charcoal. Different per side so left/right alternation has
                subtle visual difference. */}
            <div
              className={`absolute inset-0 ${
                reverse
                  ? "bg-[radial-gradient(60%_50%_at_80%_20%,rgba(160,127,212,0.12),transparent_70%)]"
                  : "bg-[radial-gradient(60%_50%_at_20%_80%,rgba(160,127,212,0.12),transparent_70%)]"
              }`}
              aria-hidden
            />
            <div className="relative h-full w-full">{visual}</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
