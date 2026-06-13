"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe, Users, Wallet, Package, BarChart3, Megaphone, IdCard, ShoppingCart,
} from "lucide-react";

/** Cinematic bento grid for the home page. Six cards in an asymmetric
 *  layout, each with its own micro-animation that loops in place. The
 *  combined effect is "the product is alive, even on a static page" —
 *  exactly the Apple/Framer instinct.
 *
 *  Adapted from 21st.dev's animated bento with each cell tuned to a Conddo
 *  module (Website, Customers, Payments, Inventory, Analytics, Staff). */
export function AnimatedBento() {
  return (
    <section className="bg-[#0a0a0c] px-6 py-24 md:py-32">
      <div className="max-w-7xl w-full mx-auto">
        <motion.p
          className="font-mono text-[12px] uppercase tracking-[0.2em] text-primary-light mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Modules
        </motion.p>
        <motion.h2
          className="text-4xl md:text-6xl font-semibold tracking-[-0.02em] text-white mb-12 md:mb-16 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Every tool your business needs, in one workspace.
        </motion.h2>

        {/* 6-column asymmetric bento — same footprint as the home grid I
            shipped before, but every cell is now a live mini-experience. */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[200px]">
          <BentoCell
            span="md:col-span-2 md:row-span-2"
            visual={<WebsiteVisual />}
            title="Website"
            description="A storefront that sells, on your subdomain. SEO-ready, fast on 3G, mobile-first."
          />
          <BentoCell
            span="md:col-span-2"
            visual={<CustomersVisual />}
            title="Customers"
            description="A real CRM, not a contact list."
          />
          <BentoCell
            span="md:col-span-2 md:row-span-2"
            visual={<PaymentsVisual />}
            title="Naira payments"
            description="Paystack online, Routepay in-person. Reconciled into one ledger every day."
          />
          <BentoCell
            span="md:col-span-2"
            visual={<OrdersVisual />}
            title="Orders & Bookings"
          />
          <BentoCell
            span="md:col-span-3"
            visual={<AnalyticsVisual />}
            title="Analytics that decide for you"
            description="Revenue, top products, customer trends — at a glance."
          />
          <BentoCell
            span="md:col-span-3"
            visual={<StaffVisual />}
            title="Bring your team, with the right access"
            description="Five role presets — Cashier, Pharmacist, Stock Manager, Bookkeeper, Manager."
          />
        </div>
      </div>
    </section>
  );
}

function BentoCell({
  span,
  visual,
  title,
  description,
}: {
  span: string;
  visual: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <motion.div
      className={`${span} bg-[#13131a] border border-white/[0.06] rounded-2xl p-8 flex flex-col hover:border-primary/30 transition-colors cursor-pointer overflow-hidden group`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="flex-1 -mx-2">{visual}</div>
      <div className="mt-4">
        <h3 className="text-xl text-white font-medium tracking-[-0.01em]">{title}</h3>
        {description && (
          <p className="text-white/55 text-[13px] mt-1.5 leading-relaxed">{description}</p>
        )}
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------------------------------- */
/* Cell visuals — each its own loop animation. Hand-tuned for Conddo.       */
/* ----------------------------------------------------------------------- */

function WebsiteVisual() {
  // A miniature mock website slowly tilts + the URL bar types out.
  const [chars, setChars] = useState(0);
  const url = "wellspring.conddo.io";
  useEffect(() => {
    const id = setInterval(() => {
      setChars((c) => (c >= url.length ? 0 : c + 1));
    }, 130);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="h-full flex items-center justify-center relative">
      <motion.div
        className="w-[85%] aspect-[16/10] rounded-lg bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 p-3 backdrop-blur"
        animate={{ rotate: [-1, 1, -1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
          <span className="ml-2 flex-1 h-4 rounded bg-white/[0.08] px-1.5 font-mono text-[8px] text-white/50 leading-[16px]">
            {url.slice(0, chars)}
            <span className="inline-block w-px h-2.5 bg-white/40 ml-px animate-pulse" />
          </span>
        </div>
        <div className="space-y-1.5 mt-3">
          <span className="block h-2 w-2/3 rounded bg-primary/40" />
          <span className="block h-1.5 w-1/2 rounded bg-white/20" />
          <span className="block h-1.5 w-3/5 rounded bg-white/20" />
        </div>
        <div className="grid grid-cols-3 gap-1.5 mt-3">
          <span className="h-7 rounded bg-white/[0.08]" />
          <span className="h-7 rounded bg-white/[0.08]" />
          <span className="h-7 rounded bg-white/[0.08]" />
        </div>
      </motion.div>
      <Globe className="absolute right-3 top-3 w-4 h-4 text-white/30" />
    </div>
  );
}

function CustomersVisual() {
  // Cycles through three customer avatars with the active one glowing.
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % 3), 1800);
    return () => clearInterval(id);
  }, []);
  const customers = [
    { initial: "AO", name: "Adebayo O.", tag: "Diamond" },
    { initial: "FT", name: "Funke T.",   tag: "Returning" },
    { initial: "SK", name: "Sade K.",    tag: "New" },
  ];
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col gap-2 w-[90%]">
        {customers.map((c, i) => {
          const isActive = i === active;
          return (
            <motion.div
              key={c.name}
              className="flex items-center gap-3 rounded-lg border px-3 py-2"
              animate={{
                borderColor: isActive ? "rgba(160,127,212,0.4)" : "rgba(255,255,255,0.06)",
                backgroundColor: isActive ? "rgba(160,127,212,0.06)" : "rgba(255,255,255,0.02)",
              }}
              transition={{ duration: 0.6 }}
            >
              <motion.span
                className="h-7 w-7 rounded-full bg-primary/20 text-primary-light font-mono text-[10px] flex items-center justify-center"
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {c.initial}
              </motion.span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-white/90 truncate">{c.name}</p>
                <p className="text-[10px] text-white/40">{c.tag}</p>
              </div>
              <Users className="h-3 w-3 text-white/30" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function PaymentsVisual() {
  // Naira amount tick-up animation that loops.
  const [amount, setAmount] = useState(0);
  useEffect(() => {
    const target = 487_400;
    const steps = 40;
    let step = 0;
    const id = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setAmount(Math.floor(target * eased));
      if (step >= steps) {
        clearInterval(id);
        setTimeout(() => setAmount(0), 2200);
      }
    }, 50);
    return () => clearInterval(id);
  }, [amount === 0 ? "reset" : undefined]);
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <Wallet className="h-6 w-6 text-primary-light" />
      <div className="font-mono text-3xl md:text-4xl text-white font-medium tabular-nums">
        ₦{amount.toLocaleString("en-NG")}
      </div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Today</p>
      <div className="w-full max-w-[140px] h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-light to-rose-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (amount / 487_400) * 100)}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>
    </div>
  );
}

function OrdersVisual() {
  // Order stage progresses: Pending → Production → Ready → Delivered, on loop.
  const stages = ["Pending", "Production", "Ready", "Delivered"];
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % stages.length), 1500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-2 mb-1">
        <ShoppingCart className="h-4 w-4 text-white/40" />
        <span className="font-mono text-[11px] text-white/40">#ORD-2026-0421</span>
      </div>
      <div className="flex items-center gap-1">
        {stages.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <motion.span
              className="h-2 w-2 rounded-full"
              animate={{
                backgroundColor: i <= active ? "rgba(160,127,212,0.9)" : "rgba(255,255,255,0.15)",
                scale: i === active ? 1.4 : 1,
              }}
              transition={{ duration: 0.5 }}
            />
            {i < stages.length - 1 && (
              <motion.span
                className="h-px w-8"
                animate={{
                  backgroundColor: i < active ? "rgba(160,127,212,0.6)" : "rgba(255,255,255,0.1)",
                }}
                transition={{ duration: 0.5 }}
              />
            )}
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={stages[active]}
          className="text-[14px] text-white font-medium"
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.4 }}
        >
          {stages[active]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function AnalyticsVisual() {
  // Bars rise + a number ticks up. Re-randomises every loop.
  const [data, setData] = useState<number[]>([]);
  useEffect(() => {
    const reseed = () =>
      setData(Array.from({ length: 12 }, () => 30 + Math.random() * 70));
    reseed();
    const id = setInterval(reseed, 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="h-full flex items-end justify-center gap-1.5 px-2">
      {data.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-md bg-gradient-to-t from-primary/70 to-primary-light/40"
          initial={{ height: 4 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.8, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxHeight: "85%" }}
        />
      ))}
      <BarChart3 className="absolute right-3 top-3 w-4 h-4 text-white/30" />
    </div>
  );
}

function StaffVisual() {
  const roles = ["Manager", "Pharmacist", "Cashier", "Stock Manager", "Bookkeeper"];
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-wrap gap-2 justify-center max-w-[90%]">
        {roles.map((r, i) => (
          <motion.span
            key={r}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-[12px] text-white/80 font-medium"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.08 }}
            whileHover={{ borderColor: "rgba(160,127,212,0.45)", color: "white" }}
          >
            <IdCard className="h-3 w-3 text-primary-light" />
            {r}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
