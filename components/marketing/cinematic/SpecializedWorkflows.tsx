"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Stethoscope, Shirt, Music2, ShoppingBag, Briefcase, Truck,
  ArrowUpRight, type LucideIcon,
} from "lucide-react";

/** "Specialized Workflows" section — six vertical-specific workflow cards.
 *  The first three (Healthcare, Fashion, Music Studios) link to their
 *  existing deep landings; the rest sit as "coming soon" tiles so the
 *  user sees the roadmap without dead clicks. */

type Workflow = {
  icon: LucideIcon;
  label: string;
  description: string;
  /** Deep landing path if one exists; null = placeholder tile. */
  href: string | null;
};

const workflows: Workflow[] = [
  {
    icon: Stethoscope,
    label: "Healthcare",
    description: "Prescriptions, expiry tracking, patient records.",
    href: "/businesses/pharmacy",
  },
  {
    icon: Shirt,
    label: "Fashion & Apparel",
    description: "Measurements, fittings, production tracking.",
    href: "/businesses/fashion",
  },
  {
    icon: Music2,
    label: "Music Studios",
    description: "Sessions, schedules, artist management.",
    href: "/businesses/music-studio",
  },
  {
    icon: ShoppingBag,
    label: "Retail",
    description: "Inventory, suppliers, multi-location stock.",
    href: null,
  },
  {
    icon: Briefcase,
    label: "Consulting",
    description: "Clients, retainers, invoices.",
    href: null,
  },
  {
    icon: Truck,
    label: "Logistics",
    description: "Routes, deliveries, proof of completion.",
    href: null,
  },
];

export function SpecializedWorkflows() {
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-32">
        <div className="max-w-3xl mb-14 md:mb-20">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Specialized workflows
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Built for the details <span className="text-primary-light">that matter</span>.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((w, i) => (
            <WorkflowTile key={w.label} workflow={w} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowTile({ workflow, index }: { workflow: Workflow; index: number }) {
  const inner = (
    <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur h-full transition-colors group-hover:border-primary/30">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-light border border-primary/20 transition-colors group-hover:bg-primary/15">
          <workflow.icon size={20} strokeWidth={1.5} />
        </span>
        {workflow.href ? (
          <ArrowUpRight
            size={16}
            className="text-white/30 transition-colors group-hover:text-primary-light"
          />
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/45">
            Soon
          </span>
        )}
      </div>
      <p className="mt-6 text-[17px] font-medium text-white leading-snug">
        {workflow.label}
      </p>
      <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
        {workflow.description}
      </p>
    </div>
  );

  return (
    <motion.div
      className={`group ${workflow.href ? "cursor-pointer" : "cursor-default"}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={workflow.href ? { y: -4 } : undefined}
    >
      {workflow.href ? <Link href={workflow.href}>{inner}</Link> : inner}
    </motion.div>
  );
}
