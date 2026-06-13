"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, ShoppingBag, Users, Wallet, Megaphone,
  type LucideIcon,
} from "lucide-react";
import { Frame } from "./Frame";
import { Chip } from "../ui/Chip";

/**
 * The hero's product preview. Auto-rotates through 5 tabs so a visitor sees
 * "this is a real working product" without scrolling — Dashboard → Orders →
 * Customers → Payments → Marketing, ~4s on each. Sidebar highlight + URL
 * pill + main panel content all swap together. Honours
 * `prefers-reduced-motion` (freezes on Dashboard) and pauses on hover so
 * the visitor can study any frame they like.
 *
 * Larger and visually denser than the original DashboardPreview because the
 * audit called the static preview "floating without context" — this carries
 * the whole hero now, so it earns the full container width.
 */

type TabId = "dashboard" | "orders" | "customers" | "payments" | "marketing";

type Tab = {
  id: TabId;
  label: string;
  icon: LucideIcon;
  url: string;
  // The right-hand panel body rendered when this tab is active.
  Body: React.FC;
};

const TABS: Tab[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid, url: "amaka-styles.conddo.io", Body: DashboardBody },
  { id: "orders",    label: "Orders",    icon: ShoppingBag, url: "amaka-styles.conddo.io/orders", Body: OrdersBody },
  { id: "customers", label: "Customers", icon: Users,       url: "amaka-styles.conddo.io/customers", Body: CustomersBody },
  { id: "payments",  label: "Payments",  icon: Wallet,      url: "amaka-styles.conddo.io/payments", Body: PaymentsBody },
  { id: "marketing", label: "Marketing", icon: Megaphone,   url: "amaka-styles.conddo.io/marketing", Body: MarketingBody },
];

const ROTATE_MS = 4000;

export function HeroPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Honour prefers-reduced-motion: freeze on the first tab.
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || paused) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % TABS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [reducedMotion, paused]);

  const active = TABS[activeIndex];
  const ActiveBody = active.Body;

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative"
    >
      <Frame url={active.url} className="shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)]">
        {/* Mobile-only tab strip — the desktop sidebar is hidden below sm so
            without this, a phone user can't see which "tab" they're on or jump
            between them. Horizontally scrolls if there are more tabs than fit. */}
        <div className="flex gap-2 overflow-x-auto border-b border-neutral-border bg-neutral-surface2/60 px-3 py-2 sm:hidden">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => { setActiveIndex(i); setPaused(true); }}
              aria-pressed={i === activeIndex}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                i === activeIndex
                  ? "bg-primary-bg text-primary"
                  : "text-content-secondary hover:text-ink"
              }`}
            >
              <t.icon size={13} strokeWidth={2} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr]">
          {/* Sidebar */}
          <aside className="hidden border-r border-neutral-border bg-neutral-surface2/60 p-4 sm:block">
            <div className="mb-5 px-2 font-sans text-sm font-medium tracking-[0.02em]">
              <span className="text-ink">conddo</span>
              <span className="text-primary">.io</span>
            </div>
            <nav className="space-y-1">
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { setActiveIndex(i); setPaused(true); }}
                  aria-pressed={i === activeIndex}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                    i === activeIndex
                      ? "bg-primary-bg font-medium text-primary"
                      : "text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
                  }`}
                >
                  <t.icon size={15} strokeWidth={2} />
                  {t.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main panel */}
          <div className="p-5 sm:p-6">
            <ActiveBody />
          </div>
        </div>
      </Frame>

      {/* Dots — current frame indicator. Click to jump. */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            type="button"
            onClick={() => { setActiveIndex(i); setPaused(true); }}
            aria-label={`Show ${t.label}`}
            className={`h-1.5 rounded-full transition-all ${
              i === activeIndex ? "w-6 bg-primary-light" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-tab panel bodies. Each is its own small, dense snapshot — the kind of
// "this is real" detail a visitor can study during the 4s frame.
// ---------------------------------------------------------------------------

function PanelHeader({ greeting, sub, chip }: { greeting: string; sub: string; chip: string }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <div>
        <p className="text-[13px] text-content-muted">{greeting}</p>
        <p className="text-base font-medium text-ink">{sub}</p>
      </div>
      <Chip tone="primary">{chip}</Chip>
    </div>
  );
}

function DashboardBody() {
  const stats = [
    { label: "Revenue", value: "₦1.84M", delta: "+12%", tone: "success" as const },
    { label: "Orders", value: "146", delta: "+8", tone: "success" as const },
    { label: "New customers", value: "32", delta: "this week", tone: "neutral" as const },
  ];
  const bars = [38, 52, 44, 70, 60, 88, 64];
  return (
    <>
      <PanelHeader greeting="Good morning," sub="Amaka 👋" chip="Today" />
      <div className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-neutral-border bg-neutral-surface p-3">
            <p className="mb-1 text-[11px] text-content-muted">{s.label}</p>
            <p className="font-mono text-lg font-medium leading-none text-ink">{s.value}</p>
            <p className={`mt-1.5 font-mono text-[10px] ${s.tone === "success" ? "text-success" : "text-content-muted"}`}>
              {s.delta}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-neutral-border bg-neutral-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-medium text-ink">Revenue this week</p>
          <span className="font-mono text-[11px] text-content-muted">Mon–Sun</span>
        </div>
        <div className="flex h-24 items-end gap-2">
          {bars.map((h, i) => (
            <div key={i} className={`flex-1 rounded-sm ${i === bars.length - 2 ? "bg-primary" : "bg-primary/25"}`} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </>
  );
}

function OrdersBody() {
  const pipeline = [
    { id: "#1042", name: "Adaeze — Wrap dress", tone: "info" as const, stage: "Received" },
    { id: "#1039", name: "Tunde — 3pc Agbada", tone: "warning" as const, stage: "In production" },
    { id: "#1036", name: "Ngozi — Gele set", tone: "primary" as const, stage: "Ready" },
    { id: "#1031", name: "Bola — Kaftan", tone: "success" as const, stage: "Delivered" },
  ];
  return (
    <>
      <PanelHeader greeting="Orders," sub="4 active" chip="This week" />
      <ul className="space-y-2">
        {pipeline.map((o) => (
          <li key={o.id} className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-content-muted">{o.id}</span>
              <span className="text-[13px] text-ink">{o.name}</span>
            </div>
            <Chip tone={o.tone}>{o.stage}</Chip>
          </li>
        ))}
      </ul>
    </>
  );
}

function CustomersBody() {
  const customers = [
    { name: "Adaeze Okonkwo", spent: "₦248,500", orders: 14, status: "VIP" },
    { name: "Tunde Bakare",   spent: "₦182,000", orders: 9,  status: "Regular" },
    { name: "Ngozi Chukwu",   spent: "₦96,000",  orders: 5,  status: "Regular" },
    { name: "Bola Adeyemi",   spent: "₦44,000",  orders: 2,  status: "New" },
  ];
  return (
    <>
      <PanelHeader greeting="Customers," sub="284 total · 32 new" chip="All time" />
      <div className="overflow-hidden rounded-lg border border-neutral-border">
        <ul className="divide-y divide-white/[0.06] bg-neutral-surface">
          {customers.map((c) => (
            <li key={c.name} className="flex items-center justify-between px-3.5 py-2.5">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-bg font-mono text-[10px] font-medium text-primary">
                  {c.name.split(" ").map((p) => p[0]).join("")}
                </span>
                <div>
                  <p className="text-[13px] text-ink">{c.name}</p>
                  <p className="font-mono text-[11px] text-content-muted">{c.orders} orders · {c.spent}</p>
                </div>
              </div>
              <Chip tone={c.status === "VIP" ? "primary" : c.status === "Regular" ? "neutral" : "success"}>
                {c.status}
              </Chip>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function PaymentsBody() {
  const tiles = [
    { label: "Received", value: "₦1.62M", tone: "success" as const, delta: "+₦184k today" },
    { label: "Outstanding", value: "₦220k", tone: "neutral" as const, delta: "12 invoices" },
    { label: "Overdue", value: "₦68k", tone: "danger" as const, delta: "3 customers" },
  ];
  return (
    <>
      <PanelHeader greeting="Payments," sub="This month" chip="Naira" />
      <div className="mb-5 grid grid-cols-3 gap-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-lg border border-neutral-border bg-neutral-surface p-3">
            <p className="mb-1 text-[11px] text-content-muted">{t.label}</p>
            <p className="font-mono text-lg font-medium leading-none text-ink">{t.value}</p>
            <p className={`mt-1.5 font-mono text-[10px] ${t.tone === "success" ? "text-success" : t.tone === "danger" ? "text-danger" : "text-content-muted"}`}>
              {t.delta}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-neutral-border bg-neutral-surface p-4">
        <p className="mb-3 text-[12px] font-medium text-ink">Recent transactions</p>
        <ul className="space-y-2">
          {[
            { who: "Paystack · Adaeze O.", amt: "+₦78,000", t: "Today, 10:24" },
            { who: "POS · Wellspring P.", amt: "+₦24,500", t: "Today, 09:11" },
            { who: "Transfer · Tunde B.",  amt: "+₦12,000", t: "Yesterday" },
          ].map((tx) => (
            <li key={tx.t + tx.who} className="flex items-center justify-between text-[12px]">
              <span className="text-content-secondary">{tx.who}</span>
              <span className="flex items-center gap-3">
                <span className="font-mono text-content-muted">{tx.t}</span>
                <span className="font-mono font-medium text-success">{tx.amt}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function MarketingBody() {
  const campaigns = [
    { name: "Lagos Style Drop", channel: "Instagram Ads", spend: "₦35,000", reach: "12.4k", tone: "success" as const, label: "Active" },
    { name: "Easter Promo",      channel: "Email · 1,240 contacts", spend: "—",          reach: "1,240", tone: "primary" as const, label: "Scheduled" },
    { name: "Repeat Customers",  channel: "SMS · 380 contacts",      spend: "₦3,800",     reach: "380",   tone: "neutral" as const, label: "Sent" },
  ];
  return (
    <>
      <PanelHeader greeting="Marketing," sub="3 campaigns running" chip="Naira ads" />
      <ul className="space-y-2">
        {campaigns.map((c) => (
          <li key={c.name} className="rounded-lg border border-neutral-border bg-neutral-surface p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[13px] font-medium text-ink">{c.name}</p>
              <Chip tone={c.tone}>{c.label}</Chip>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px] text-content-muted">
              <span>{c.channel}</span>
              <span>{c.spend} · {c.reach} reach</span>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

// Small hook for prefers-reduced-motion. Client-only — the rotate effect that
// uses this is in a "use client" component, so we don't need an SSR guard.
function useReducedMotion(): boolean {
  const mq = useMemo(
    () => (typeof window === "undefined" ? null : window.matchMedia("(prefers-reduced-motion: reduce)")),
    [],
  );
  const [reduced, setReduced] = useState(mq?.matches ?? false);
  useEffect(() => {
    if (!mq) return;
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mq]);
  return reduced;
}
