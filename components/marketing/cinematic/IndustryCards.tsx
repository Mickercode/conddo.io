"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag, Stethoscope, Briefcase, Truck, Hotel, Palette,
  type LucideIcon,
} from "lucide-react";

/** "Supported Industries" section for /businesses — six industry cards in
 *  a 3-col grid. Each card has icon + label + one-sentence description.
 *  Tighter copy than the home FlexibilitySection (which has a 4-tile
 *  variant); this is the deeper roster. */

type Industry = {
  icon: LucideIcon;
  label: string;
  description: string;
};

const industries: Industry[] = [
  {
    icon: ShoppingBag,
    label: "Retail",
    description: "Manage products, inventory, sales, and customers from one place.",
  },
  {
    icon: Stethoscope,
    label: "Healthcare",
    description: "Appointments, records, prescriptions, and operations — connected.",
  },
  {
    icon: Briefcase,
    label: "Professional Services",
    description: "Manage clients, projects, invoices, and bookings.",
  },
  {
    icon: Truck,
    label: "Logistics",
    description: "Track deliveries, customers, payments, and operations.",
  },
  {
    icon: Hotel,
    label: "Hospitality",
    description: "Coordinate bookings, customers, teams, and daily operations.",
  },
  {
    icon: Palette,
    label: "Creative Businesses",
    description: "Manage projects, schedules, clients, and payments.",
  },
];

export function IndustryCards() {
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
            Supported industries
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Conddo works for the way <span className="text-primary-light">you</span> work.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.label}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 backdrop-blur transition-colors hover:border-primary/30"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-light border border-primary/20 group-hover:bg-primary/15 transition-colors">
                <ind.icon size={20} strokeWidth={1.5} />
              </span>
              <p className="mt-6 text-[17px] font-medium text-white leading-snug">
                {ind.label}
              </p>
              <p className="mt-2 text-[14px] text-white/55 leading-relaxed">
                {ind.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
