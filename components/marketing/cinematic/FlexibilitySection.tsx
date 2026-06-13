"use client";

import { motion } from "framer-motion";
import {
  ShoppingBag, Briefcase, Stethoscope, Truck, Hotel, type LucideIcon,
} from "lucide-react";

/** Flexibility section — "Built to adapt to your business". Industry
 *  archetype cards (Retailers / Professional services / Healthcare /
 *  Logistics / Hospitality), each with a representative icon and a
 *  one-sentence positioning. Sets up the cross-industry pitch without
 *  drilling into vertical-specific copy (that belongs on /businesses).
 *
 *  The default industry roster is the 4-tile home version; pages that
 *  want the 5-tile /product variant pass their own roster via prop. */

export type Industry = { icon: LucideIcon; label: string; tagline: string };

const DEFAULT_INDUSTRIES: Industry[] = [
  { icon: ShoppingBag, label: "Retailers",                 tagline: "manage inventory" },
  { icon: Briefcase,   label: "Professional service firms", tagline: "manage clients" },
  { icon: Stethoscope, label: "Healthcare providers",      tagline: "manage appointments" },
  { icon: Truck,       label: "Logistics companies",       tagline: "manage deliveries" },
];

/** /product page's 5-industry variant — same set as the home page but
 *  adds Hospitality. Exported so the product page imports it by name. */
export const PRODUCT_INDUSTRIES: Industry[] = [
  ...DEFAULT_INDUSTRIES,
  { icon: Hotel, label: "Hospitality businesses", tagline: "manage bookings" },
];

export function FlexibilitySection({
  industries = DEFAULT_INDUSTRIES,
  outroLine,
}: {
  industries?: Industry[];
  /** Override the long-form line at the bottom. */
  outroLine?: string;
} = {}) {
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-36">
        <div className="max-w-3xl mb-16 md:mb-20">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Flexibility
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Built to adapt to <span className="text-primary-light">your</span> business.
          </motion.h2>
          <motion.p
            className="mt-6 text-pretty text-lg md:text-xl text-white/55 leading-relaxed font-light"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Every business operates differently. Conddo adapts to the way yours works.
          </motion.p>
        </div>

        {/* Industry cards — large, deliberate, asymmetric on desktop so the
            grid doesn't feel like an evenly-stamped pattern. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {industries.map((ind, i) => (
            <motion.div
              key={ind.label}
              className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 md:p-8 backdrop-blur transition-colors hover:border-primary/30"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4 }}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary-light border border-primary/20 group-hover:bg-primary/15 transition-colors">
                <ind.icon size={20} strokeWidth={1.5} />
              </span>
              <p className="mt-6 text-[16px] md:text-[17px] font-medium text-white leading-snug">
                {ind.label}
              </p>
              <p className="mt-1.5 text-[14px] text-white/55 leading-relaxed">
                {ind.tagline}.
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="mt-16 md:mt-20 text-pretty text-xl md:text-2xl text-white/75 leading-snug font-light max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {outroLine ??
            "Whether you're selling products, delivering services, or managing complex operations, Conddo gives you the flexibility to work the way your business works."}
        </motion.p>
      </div>
    </section>
  );
}
