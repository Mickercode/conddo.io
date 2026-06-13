"use client";

import { motion } from "framer-motion";
import {
  FileSpreadsheet, MessageSquare, Mail, Calendar, Receipt, FileText,
  type LucideIcon,
} from "lucide-react";

/** Problem section — rebuilt as a visual-led story instead of a 5-bullet
 *  text list. Left column carries the rhetorical move (two-tier headline
 *  + short close); right column shows six floating tool tiles in a
 *  deliberately scattered arrangement — each one a real surface a
 *  business actually uses to track operations today (spreadsheet,
 *  WhatsApp, email, calendar, receipt, notes).
 *
 *  Each tile bobs gently in place, slightly out of sync with its neighbors,
 *  so the right column reads as "unsettled state" — the literal scattered
 *  feeling the copy describes. Mobile collapses to a clean stack. */

type ToolTile = {
  icon: LucideIcon;
  /** Short label rendered inside the tile chrome. */
  label: string;
  /** Concrete state line — what a business owner actually sees in this
   *  tool ("inventory.xlsx · 247 rows", etc.). */
  state: string;
  /** Position in the floating cluster (% of the right-column container). */
  x: number;
  y: number;
  /** Rest rotation in degrees. */
  rotate: number;
  /** Per-tile bob delay so the floating motion is offset. */
  bobDelay: number;
};

const TILES: ToolTile[] = [
  {
    icon: FileSpreadsheet,
    label: "Spreadsheet",
    state: "inventory.xlsx · 247 rows",
    x: 2, y: 2, rotate: -6, bobDelay: 0,
  },
  {
    icon: MessageSquare,
    label: "WhatsApp",
    state: "Order from Mrs. A — 4 items",
    x: 55, y: 8, rotate: 4, bobDelay: 1.2,
  },
  {
    icon: Calendar,
    label: "Google Calendar",
    state: "Tue 3:00pm · Consultation",
    x: 12, y: 38, rotate: 3, bobDelay: 0.6,
  },
  {
    icon: Receipt,
    label: "POS Terminal",
    state: "₦47,200 · cash",
    x: 60, y: 42, rotate: -3, bobDelay: 1.8,
  },
  {
    icon: Mail,
    label: "Email",
    state: "Re: invoice for July",
    x: 4, y: 70, rotate: -2, bobDelay: 2.2,
  },
  {
    icon: FileText,
    label: "Sticky note",
    state: "Call back about refill",
    x: 50, y: 75, rotate: 6, bobDelay: 0.9,
  },
];

export function ProblemSection() {
  return (
    <section className="cinema-surface">
      {/* Subtle radial highlight bleeding the section in from above. */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

      <div className="relative container-x py-24 md:py-36">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] gap-10 lg:gap-16 items-center">
          {/* LEFT — narrative. Two-tier headline + short close, nothing more. */}
          <div>
            <motion.h2
              className="text-balance text-4xl md:text-6xl font-semibold tracking-tighter text-white/85 leading-[1.05]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              Most businesses don&apos;t have a{" "}
              <span className="text-white/40">growth</span> problem.
            </motion.h2>
            <motion.h2
              className="mt-4 text-balance text-4xl md:text-6xl font-semibold tracking-tighter text-white leading-[1.05]"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            >
              They have an <span className="cinema-aurora">operations</span> problem.
            </motion.h2>

            <motion.p
              className="mt-10 text-pretty text-lg md:text-xl text-white/65 leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, delay: 0.35 }}
            >
              Conddo brings everything together so your business can operate with{" "}
              <span className="text-primary-light">clarity</span>,{" "}
              <span className="text-primary-light">consistency</span>, and{" "}
              <span className="text-primary-light">control</span>.
            </motion.p>
          </div>

          {/* RIGHT — scattered tool tiles. */}
          <div className="relative h-[420px] md:h-[520px] hidden lg:block">
            {TILES.map((tile, i) => (
              <FloatingToolTile key={tile.label} tile={tile} index={i} />
            ))}

            {/* Faint dashed connection lines between tiles — never quite
                touching, suggesting "these don't actually talk to each
                other". Pure SVG, no animation needed; the bob handles
                the motion. */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full pointer-events-none opacity-40"
              aria-hidden
            >
              <line x1="20" y1="14" x2="55" y2="20" stroke="rgba(255,255,255,0.15)" strokeWidth="0.2" strokeDasharray="1 1.5" />
              <line x1="22" y1="48" x2="50" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="0.2" strokeDasharray="1 1.5" />
              <line x1="20" y1="80" x2="48" y2="82" stroke="rgba(255,255,255,0.15)" strokeWidth="0.2" strokeDasharray="1 1.5" />
            </svg>
          </div>

          {/* Mobile fallback — vertical stack of the tiles, no offsets. */}
          <div className="space-y-3 lg:hidden">
            {TILES.map((tile, i) => (
              <motion.div
                key={tile.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.5 }}
                style={{ rotate: `${tile.rotate}deg` }}
              >
                <ToolTileChrome tile={tile} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Floating wrapper — handles entrance + infinite bob in place. */
function FloatingToolTile({ tile, index }: { tile: ToolTile; index: number }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${tile.x}%`,
        top: `${tile.y}%`,
        rotate: `${tile.rotate}deg`,
      }}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay: 0.15 + index * 0.1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0, 6, 0] }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: tile.bobDelay,
          ease: "easeInOut",
        }}
      >
        <ToolTileChrome tile={tile} />
      </motion.div>
    </motion.div>
  );
}

/** The actual tile UI — used by both the floating + mobile-stack
 *  variants so they stay visually identical. */
function ToolTileChrome({ tile }: { tile: ToolTile }) {
  const Icon = tile.icon;
  return (
    <div className="w-[200px] rounded-xl border border-white/10 bg-cinema-elev/95 backdrop-blur-md px-4 py-3 shadow-cinema-strong">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] text-white/70">
          <Icon size={11} strokeWidth={2} />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-loose text-white/45">
          {tile.label}
        </span>
      </div>
      <p className="text-[12.5px] text-white/85 leading-snug">{tile.state}</p>
    </div>
  );
}
