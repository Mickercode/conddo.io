"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

/** Cinematic compare-plans matrix — three plan columns × feature rows.
 *  Sections group the matrix into "Core / Growth / Scale" so the visual
 *  hierarchy follows the upgrade path. Sticky header on tablet+.
 *
 *  Lives under the plan cards on /pricing. Same feature list the user
 *  brief outlines; rows where a plan doesn't include a feature show
 *  an em-dash rather than a check, so visual scanning is fast. */

type Row = { label: string; launcher: boolean; growth: boolean; scaler: boolean };

const groups: { heading: string; rows: Row[] }[] = [
  {
    heading: "Core platform",
    rows: [
      { label: "Website",            launcher: true, growth: true, scaler: true },
      { label: "Customers & CRM",    launcher: true, growth: true, scaler: true },
      { label: "Orders & Bookings",  launcher: true, growth: true, scaler: true },
      { label: "Payments",           launcher: true, growth: true, scaler: true },
      { label: "Inventory",          launcher: true, growth: true, scaler: true },
      { label: "Analytics",          launcher: true, growth: true, scaler: true },
    ],
  },
  {
    heading: "Growth tools",
    rows: [
      { label: "Custom Domain",         launcher: false, growth: true, scaler: true },
      { label: "Business Email",        launcher: false, growth: true, scaler: true },
      { label: "Marketing Tools",       launcher: false, growth: true, scaler: true },
      { label: "SMS & Email Campaigns", launcher: false, growth: true, scaler: true },
    ],
  },
  {
    heading: "Scale features",
    rows: [
      { label: "Multi-location",          launcher: false, growth: false, scaler: true },
      { label: "API Access",              launcher: false, growth: false, scaler: true },
      { label: "Dedicated Account Manager", launcher: false, growth: false, scaler: true },
      { label: "Custom Configuration",    launcher: false, growth: false, scaler: true },
    ],
  },
];

export function ComparePlans() {
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
            Compare plans
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Choose what fits today. Grow into more.
          </motion.h2>
        </div>

        <motion.div
          className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-5 py-4 text-[11px] font-mono uppercase tracking-[0.12em] text-white/40">
                    Feature
                  </th>
                  <th className="px-5 py-4 text-center text-[12px] font-medium text-white/85">
                    Launcher
                  </th>
                  <th className="px-5 py-4 text-center text-[12px] font-medium text-primary-light">
                    Growth
                  </th>
                  <th className="px-5 py-4 text-center text-[12px] font-medium text-white/85">
                    Scaler
                  </th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g, gi) => (
                  <FeatureGroup key={g.heading} group={g} isFirst={gi === 0} />
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function FeatureGroup({ group, isFirst }: { group: { heading: string; rows: Row[] }; isFirst: boolean }) {
  return (
    <>
      <tr className={isFirst ? "" : "border-t border-white/[0.06]"}>
        <td colSpan={4} className="px-5 pt-7 pb-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-white/40">
          {group.heading}
        </td>
      </tr>
      {group.rows.map((r) => (
        <tr key={r.label} className="border-t border-white/[0.04] hover:bg-white/[0.02] transition-colors">
          <td className="px-5 py-3.5 text-[14px] text-white/85">{r.label}</td>
          <Cell included={r.launcher} />
          <Cell included={r.growth} accent />
          <Cell included={r.scaler} />
        </tr>
      ))}
    </>
  );
}

function Cell({ included, accent = false }: { included: boolean; accent?: boolean }) {
  return (
    <td className="px-5 py-3.5 text-center">
      {included ? (
        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
          accent ? "bg-primary/15 text-primary-light" : "bg-white/[0.06] text-white/85"
        }`}>
          <Check size={13} strokeWidth={2.5} />
        </span>
      ) : (
        <span className="text-white/25">—</span>
      )}
    </td>
  );
}
