"use client";

import { motion } from "framer-motion";
import { MapPin, Users, Tag, UserPlus } from "lucide-react";

/** "Grow without switching platforms" section — 2-column layout. Left
 *  column carries the narrative (eyebrow + "Start simple" headline +
 *  staircase + closing line). Right column shows four stacked mockup
 *  cards that visualise the "Add X" steps as concrete UI moments.
 *
 *  The cards are absolutely positioned and slightly rotated/offset so
 *  they read as a depth stack — each one a different module receiving
 *  new state as the business grows. Each card enters staggered to match
 *  the staircase's rhythm. */

const steps: { label: string; mockup: React.ReactNode; offsetY: number; offsetX: number; rotate: number }[] = [
  {
    label: "Add locations.",
    mockup: <LocationsCard />,
    offsetY: 0,
    offsetX: 0,
    rotate: -3,
  },
  {
    label: "Add staff.",
    mockup: <StaffCard />,
    offsetY: 110,
    offsetX: 35,
    rotate: 2,
  },
  {
    label: "Add services.",
    mockup: <ServicesCard />,
    offsetY: 230,
    offsetX: 8,
    rotate: -2,
  },
  {
    label: "Add customers.",
    mockup: <CustomersCard />,
    offsetY: 360,
    offsetX: 50,
    rotate: 3,
  },
];

export function GrowWithoutSwitching() {
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      {/* Soft glow on the right side so the card stack has light to rise
          out of. */}
      <div className="absolute inset-0 bg-[radial-gradient(50%_70%_at_80%_50%,rgba(160,127,212,0.08),transparent_70%)] pointer-events-none" />

      <div className="relative container-x py-24 md:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-10 lg:gap-16 items-center">
          {/* Left column — narrative. */}
          <div>
            <motion.p
              className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Grow without switching platforms
            </motion.p>
            <motion.h2
              className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Start simple.
            </motion.h2>

            {/* Staircase — same rhythm as before. */}
            <div className="mt-10 md:mt-12 space-y-2.5 md:space-y-3">
              {steps.map((s, i) => (
                <motion.p
                  key={s.label}
                  className="text-pretty text-xl md:text-3xl font-light text-white/75 leading-snug"
                  style={{ paddingLeft: `${i * 1.1}rem` }}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.15 + i * 0.12,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                >
                  {s.label}
                </motion.p>
              ))}
            </div>

            <motion.p
              className="mt-10 md:mt-14 text-pretty text-2xl md:text-3xl font-medium leading-snug text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Conddo <span className="text-primary-light">scales</span> with your business.
            </motion.p>
          </div>

          {/* Right column — card stack. */}
          <div className="relative h-[520px] hidden lg:block">
            {steps.map((s, i) => (
              <motion.div
                key={s.label}
                className="absolute left-0 right-0"
                style={{ top: s.offsetY, paddingLeft: s.offsetX }}
                initial={{ opacity: 0, y: 40, rotate: s.rotate * 2 }}
                whileInView={{ opacity: 1, y: 0, rotate: s.rotate }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.8,
                  delay: 0.3 + i * 0.18,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
              >
                {s.mockup}
              </motion.div>
            ))}
          </div>

          {/* Mobile fallback — vertical stack, no offsets/rotation. */}
          <div className="space-y-3 lg:hidden">
            {steps.map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                {s.mockup}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------- */
/* Mockup cards — each one a fake UI moment of a module receiving         */
/* new state. Tuned to the same visual language as the bento cells.       */
/* ---------------------------------------------------------------------- */

function LocationsCard() {
  return (
    <div className="w-[88%] rounded-2xl border border-white/[0.08] bg-[#13131a] p-5 backdrop-blur shadow-[0_30px_60px_-30px_rgba(124,92,191,0.5)]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
          Locations
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
          +1 new
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <MapPin className="h-3.5 w-3.5 text-primary-light" />
          <div className="flex-1">
            <p className="text-[12px] text-white">Lagos · Surulere</p>
            <p className="font-mono text-[9.5px] text-white/40">127 customers · ₦847k revenue</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/[0.08] px-3 py-2">
          <MapPin className="h-3.5 w-3.5 text-primary-light" />
          <div className="flex-1">
            <p className="text-[12px] text-white">Abuja · Wuse 2</p>
            <p className="font-mono text-[9.5px] text-primary-light">Just added</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffCard() {
  return (
    <div className="w-[80%] rounded-2xl border border-white/[0.08] bg-[#13131a] p-5 backdrop-blur shadow-[0_30px_60px_-30px_rgba(124,92,191,0.5)]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
          Team
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] text-primary-light">
          <UserPlus className="h-2.5 w-2.5" />
          3 invited
        </span>
      </div>
      <div className="flex items-center gap-2">
        {["AO", "FT", "SK", "MO", "TJ"].map((initials, i) => (
          <span
            key={initials}
            className={`flex h-7 w-7 items-center justify-center rounded-full text-[9.5px] font-mono uppercase tracking-[0.04em] ${
              i < 2
                ? "bg-white/[0.08] text-white/85 border border-white/10"
                : "bg-primary/15 text-primary-light border border-primary/30"
            }`}
          >
            {initials}
          </span>
        ))}
      </div>
    </div>
  );
}

function ServicesCard() {
  return (
    <div className="w-[85%] rounded-2xl border border-white/[0.08] bg-[#13131a] p-5 backdrop-blur shadow-[0_30px_60px_-30px_rgba(124,92,191,0.5)]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
          Services
        </span>
        <Tag className="h-3 w-3 text-primary-light" />
      </div>
      <div className="space-y-1.5">
        {[
          { name: "Walk-in consultation", price: "₦5,000", muted: true },
          { name: "Home delivery", price: "₦2,500", muted: true },
          { name: "Premium membership", price: "₦18,000/mo", muted: false },
        ].map((s) => (
          <div
            key={s.name}
            className={`flex items-center justify-between rounded-lg border px-3 py-2 ${
              s.muted
                ? "border-white/[0.06] bg-white/[0.02]"
                : "border-primary/30 bg-primary/[0.08]"
            }`}
          >
            <p className="text-[12px] text-white">{s.name}</p>
            <p className={`font-mono text-[10.5px] tabular-nums ${
              s.muted ? "text-white/55" : "text-primary-light"
            }`}>
              {s.price}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomersCard() {
  return (
    <div className="w-[78%] rounded-2xl border border-white/[0.08] bg-[#13131a] p-5 backdrop-blur shadow-[0_30px_60px_-30px_rgba(124,92,191,0.5)]">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/45">
          Customers
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] text-emerald-300">
          <Users className="h-2.5 w-2.5" />
          +247 this week
        </span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[24px] font-medium text-white leading-none tabular-nums">
            12,847
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-white/40">
            Active
          </p>
        </div>
        {/* Mini sparkline bars */}
        <div className="flex items-end gap-0.5 h-10">
          {[40, 55, 48, 62, 70, 68, 85, 92].map((h, i) => (
            <span
              key={i}
              className="w-1 rounded-t-sm bg-gradient-to-t from-primary/60 to-primary-light/60"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
