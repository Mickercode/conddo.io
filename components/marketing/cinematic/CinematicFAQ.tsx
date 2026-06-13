"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

/** Cinematic FAQ — vertical accordion. Each row expands on click with a
 *  smooth height + opacity transition. Only one row open at a time.
 *
 *  Same operations-platform tone as the rest of the page: tight copy, no
 *  filler. Five questions from the brief. */

const faqs: { q: string; a: string }[] = [
  {
    q: "Is Conddo a marketplace?",
    a: "No. Conddo gives you your own website, customers, data, and brand. You are not competing with other businesses on a shared marketplace.",
  },
  {
    q: "Do I need technical skills to use Conddo?",
    a: "No. Conddo is designed for business owners and teams, not developers.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes. Upgrade or downgrade at any time as your business grows.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. Custom domains are available on Growth and Scaler plans.",
  },
  {
    q: "Are there any hidden fees?",
    a: "No. Conddo charges a simple subscription fee. Standard payment processing fees from providers may still apply.",
  },
];

export function CinematicFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-32">
        <div className="max-w-3xl mb-12 md:mb-16">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            FAQ
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Questions, answered.
          </motion.h2>
        </div>

        <div className="max-w-3xl rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur divide-y divide-white/[0.06]">
          {faqs.map((faq, i) => {
            const open = openIndex === i;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 px-6 md:px-7 py-5 md:py-6 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="text-[16px] md:text-[17px] font-medium text-white leading-snug">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: open ? 45 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-primary-light"
                  >
                    <Plus size={13} strokeWidth={2} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 md:px-7 pb-6 md:pb-7 text-[15px] md:text-[16px] text-white/65 leading-relaxed font-light">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
