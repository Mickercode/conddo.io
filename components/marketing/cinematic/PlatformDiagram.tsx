"use client";

import { motion } from "framer-motion";
import {
  Globe, Users, ShoppingCart, Package, Wallet, Megaphone, BarChart3, IdCard,
  type LucideIcon,
} from "lucide-react";

/** Platform overview diagram — eight module nodes orbiting a central
 *  "Conddo" hub. Connection lines between every node + hub pulse on a
 *  shared loop, giving the section a literal sense of "everything talks
 *  to everything". Pure SVG + Framer; no images. */

type ModuleNode = {
  label: string;
  icon: LucideIcon;
  /** Position in the orbit, 0..1 (clockwise from 12 o'clock). */
  t: number;
};

const NODES: ModuleNode[] = [
  { label: "Website",   icon: Globe,        t: 0    },
  { label: "Customers", icon: Users,        t: 0.125 },
  { label: "Orders",    icon: ShoppingCart, t: 0.25  },
  { label: "Inventory", icon: Package,      t: 0.375 },
  { label: "Payments",  icon: Wallet,       t: 0.5   },
  { label: "Marketing", icon: Megaphone,    t: 0.625 },
  { label: "Analytics", icon: BarChart3,    t: 0.75  },
  { label: "Team",      icon: IdCard,       t: 0.875 },
];

const CENTER = 50;     // % of the viewbox
const RADIUS = 38;     // % of the viewbox

function polar(t: number) {
  // t = 0 at 12 o'clock, increases clockwise.
  const theta = t * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER + RADIUS * Math.cos(theta),
    y: CENTER + RADIUS * Math.sin(theta),
  };
}

export function PlatformDiagram() {
  return (
    <section className="relative bg-[#0a0a0c] overflow-hidden">
      <div className="container-x py-24 md:py-32">
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-20">
          <motion.p
            className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            The platform
          </motion.p>
          <motion.h2
            className="text-balance text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white leading-[1.05]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Everything your business needs to operate and grow.
          </motion.h2>
        </div>

        {/* Diagram + module pills. Diagram is purely visual; the pills
            below it are the readable list (for accessibility + small
            screens where the diagram becomes too tight). */}
        <div className="relative max-w-3xl mx-auto aspect-square">
          <DiagramSvg />
        </div>
      </div>
    </section>
  );
}

function DiagramSvg() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#a07fd4" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#7c5cbf" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#7c5cbf" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="edge-pulse" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"  stopColor="#a07fd4" stopOpacity="0" />
          <stop offset="50%" stopColor="#a07fd4" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#a07fd4" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Hub glow */}
      <circle cx={CENTER} cy={CENTER} r="14" fill="url(#hub-glow)" />

      {/* Static edges — thin lines from hub to each module. */}
      {NODES.map((n, i) => {
        const { x, y } = polar(n.t);
        return (
          <line
            key={`edge-${i}`}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="0.15"
          />
        );
      })}

      {/* Pulsing edges — animated overlay on top of the static ones. */}
      {NODES.map((n, i) => {
        const { x, y } = polar(n.t);
        return (
          <motion.line
            key={`pulse-${i}`}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="url(#edge-pulse)"
            strokeWidth="0.4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: [0, 1, 1], opacity: [0, 0.9, 0] }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut",
            }}
          />
        );
      })}

      {/* Central Conddo hub — circle + label. */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <circle cx={CENTER} cy={CENTER} r="8" fill="#13131a" stroke="rgba(160,127,212,0.45)" strokeWidth="0.4" />
        <text
          x={CENTER}
          y={CENTER + 0.7}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="2.6"
          fontWeight="600"
          fill="#ffffff"
          letterSpacing="-0.04em"
          fontFamily="ui-sans-serif, system-ui, -apple-system"
        >
          Conddo
        </text>
      </motion.g>

      {/* Module nodes — circle + icon + label. */}
      {NODES.map((n, i) => {
        const { x, y } = polar(n.t);
        return <ModuleNodeSvg key={n.label} node={n} x={x} y={y} index={i} />;
      })}
    </svg>
  );
}

function ModuleNodeSvg({ node, x, y, index }: { node: ModuleNode; x: number; y: number; index: number }) {
  const Icon = node.icon;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{
        delay: 0.2 + index * 0.08,
        type: "spring",
        stiffness: 220,
        damping: 22,
      }}
    >
      <circle
        cx={x}
        cy={y}
        r="5.5"
        fill="#13131a"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="0.3"
      />
      {/* Lucide icons are nominally 24px; scale them down + reposition so
          the icon centres on the node. Using foreignObject so we can render
          a React Lucide component directly inside the SVG. */}
      <foreignObject x={x - 3} y={y - 3.8} width="6" height="6">
        <div className="flex h-full w-full items-center justify-center">
          <Icon size={9} className="text-primary-light" strokeWidth={1.75} />
        </div>
      </foreignObject>
      <text
        x={x}
        y={y + 4.3}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="2"
        fill="#ffffff"
        fillOpacity="0.85"
        letterSpacing="-0.02em"
        fontFamily="ui-sans-serif, system-ui, -apple-system"
      >
        {node.label}
      </text>
    </motion.g>
  );
}
