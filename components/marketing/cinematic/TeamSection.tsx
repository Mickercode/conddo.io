"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock, Layers } from "lucide-react";

/** Team section — "Bring your team into one workspace". Three negation
 *  cards ("No shared passwords / No information silos / No unnecessary
 *  complexity") sit above a closing positive line.
 *
 *  Visually echoes the Differentiator triplet but with a different
 *  rhetorical purpose: there it's the product story, here it's the
 *  team-collaboration story. */
export function TeamSection() {
  const negations = [
    { icon: Lock, label: "No shared passwords." },
    { icon: Layers, label: "No information silos." },
    { icon: ShieldCheck, label: "No unnecessary complexity." },
  ];

  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      {/* Soft radial highlight to differentiate this section from the
          surrounding dark blocks. */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/[0.04] via-transparent to-transparent pointer-events-none" />

      <div className="relative container-x py-24 md:py-36">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Team
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Bring your team into one workspace.
          </motion.h2>
          <motion.p
            className="mt-6 text-pretty text-lg md:text-xl text-white/55 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Give employees the tools and visibility they need while maintaining accountability, security, and control.
          </motion.p>
        </div>

        <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {negations.map((n, i) => (
            <motion.div
              key={n.label}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
              whileHover={{ y: -4, borderColor: "rgba(160,127,212,0.3)" }}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-light border border-primary/20">
                <n.icon size={18} strokeWidth={1.5} />
              </span>
              <p className="mt-5 text-[17px] md:text-[18px] font-medium text-white leading-snug">
                {n.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-12 md:mt-16 text-center text-pretty text-xl md:text-2xl text-white/75 leading-snug font-light max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Just a workspace designed for <span className="text-primary-light">collaboration</span>.
        </motion.p>
      </div>
    </section>
  );
}
