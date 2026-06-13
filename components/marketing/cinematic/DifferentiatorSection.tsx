"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

/** Differentiator — "Everything works together". The visual centrepiece is
 *  a connectivity diagram: four module pills (Customers → Orders → Payments
 *  → Reporting) connected by animated arrows that pulse continuously, so the
 *  page reinforces the "connected" message both verbally and visually.
 *
 *  The "no fragmented data / no duplicated work / no operational blind spots"
 *  triplet sits below the diagram as the rhetorical close. */
export function DifferentiatorSection() {
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-36">
        {/* Eyebrow + headline */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Why Conddo
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Everything works together.
          </motion.h2>
          <motion.p
            className="mt-6 text-pretty text-lg md:text-xl text-white/55 leading-relaxed font-light max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Most software solves one problem. Conddo connects every part of your business into one operating system.
          </motion.p>
        </div>

        {/* Connectivity diagram — module pills + animated arrows. The arrows
            pulse via a CSS animation so the data-flow feels live. */}
        <div className="mt-16 md:mt-20 max-w-4xl mx-auto">
          <ConnectivityDiagram />
        </div>

        {/* Triplet close */}
        <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {[
            "No fragmented data.",
            "No duplicated work.",
            "No operational blind spots.",
          ].map((line, i) => (
            <motion.div
              key={line}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.6 }}
            >
              <p className="text-[18px] md:text-[20px] font-medium text-white leading-snug">{line}</p>
            </motion.div>
          ))}
        </div>

        {/* Outro line */}
        <motion.p
          className="mt-12 md:mt-16 text-center text-pretty text-xl md:text-2xl text-white/75 leading-snug font-light max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Just one platform built to help your business move faster.
        </motion.p>
      </div>
    </section>
  );
}

/** The connectivity diagram — four module nodes joined by animated arrows.
 *  Renders horizontally on desktop, vertically on mobile, so the
 *  "connection" reads correctly at every viewport. */
function ConnectivityDiagram() {
  const nodes = [
    { label: "Customers" },
    { label: "Orders" },
    { label: "Payments" },
    { label: "Reporting" },
  ];
  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-3 md:gap-1">
      {nodes.map((n, i) => (
        <div key={n.label} className="flex flex-col md:flex-row items-center gap-3 md:gap-1">
          <motion.div
            className="relative inline-flex items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 md:px-6 py-4 backdrop-blur min-w-[140px] md:min-w-[160px]"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.15, type: "spring", stiffness: 220, damping: 22 }}
            whileHover={{ borderColor: "rgba(160,127,212,0.5)", y: -2 }}
          >
            <p className="text-[14px] md:text-[15px] font-medium text-white text-center">{n.label}</p>
          </motion.div>
          {i < nodes.length - 1 && (
            <PulsingArrow delay={0.3 + i * 0.15} />
          )}
        </div>
      ))}
    </div>
  );
}

function PulsingArrow({ delay }: { delay: number }) {
  return (
    <motion.div
      className="text-primary-light/60 px-1"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      {/* Subtle infinite pulse — keeps the connection visually "alive"
          without animating the arrow position itself (which would be
          distracting). */}
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowRight className="rotate-90 md:rotate-0" size={20} strokeWidth={1.5} />
      </motion.div>
    </motion.div>
  );
}
