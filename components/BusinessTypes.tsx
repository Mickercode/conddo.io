"use client";

import { useState } from "react";
import {
  Shirt, Cross, Truck, UtensilsCrossed, Briefcase, ShoppingBag, PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { Section, Eyebrow } from "./ui/Section";
import { Frame } from "./mocks/Frame";
import { Chip } from "./ui/Chip";

/**
 * The single most important differentiator on the page: Conddo.io is
 * vertical-intelligent. A pharmacy gets different tools than a fashion brand
 * gets different tools than a logistics company. The previous version of this
 * section communicated that as a row of text labels — a list of words. Per the
 * landing audit, this section now interactively shows what changes per vertical.
 *
 * Click a tab → the mock swaps to that vertical's dashboard panel with the
 * actual fields that vertical cares about. Pharmacy shows NAFDAC numbers +
 * expiry dates. Fashion shows measurement profiles. Consulting shows billable
 * retainers. The interactivity is the point: "select your business type" is
 * no longer a list — it's a demo.
 */

type VerticalId = "fashion" | "pharmacy" | "logistics" | "food" | "consulting" | "retail" | "events";

type Vertical = {
  id: VerticalId;
  label: string;
  icon: LucideIcon;
  /** A one-line difference summary shown above the mock. */
  promise: string;
  /** The vertical-specific panel body. */
  Body: React.FC;
};

const VERTICALS: Vertical[] = [
  { id: "fashion",    label: "Fashion",         icon: Shirt,            promise: "Measurement profiles, fabric tracking, fitting stages.",       Body: FashionBody    },
  { id: "pharmacy",   label: "Pharmacy",        icon: Cross,            promise: "NAFDAC numbers, expiry dates, prescription records.",         Body: PharmacyBody   },
  { id: "logistics",  label: "Logistics",       icon: Truck,            promise: "Live route status, delivery proof, fleet load.",               Body: LogisticsBody  },
  { id: "food",       label: "Food & Beverage", icon: UtensilsCrossed,  promise: "Menus, kitchen tickets, daily covers, supplier costs.",        Body: FoodBody       },
  { id: "consulting", label: "Consulting",      icon: Briefcase,        promise: "Retainers, billable hours, invoices, scope sign-offs.",        Body: ConsultingBody },
  { id: "retail",     label: "Retail",          icon: ShoppingBag,      promise: "SKUs, barcodes, multi-store stock, supplier orders.",          Body: RetailBody     },
  { id: "events",     label: "Events",          icon: PartyPopper,      promise: "Ticket types, guest lists, vendors, run-of-show.",             Body: EventsBody     },
];

export function BusinessTypes() {
  const [activeId, setActiveId] = useState<VerticalId>("fashion");
  const active = VERTICALS.find((v) => v.id === activeId) ?? VERTICALS[0];
  const ActiveBody = active.Body;
  const ActiveIcon = active.icon;

  return (
    <Section tone="purple">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Built for your business type</Eyebrow>
        <h2 className="text-[34px] leading-tight tracking-[-0.01em] md:text-[40px]">
          Conddo.io knows your industry.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-[1.7] text-content-secondary">
          Pick your business type below — the dashboard changes. A pharmacy
          tracks expiry dates and NAFDAC. A fashion brand tracks measurements
          and fittings. Same platform, different fields.
        </p>
      </div>

      {/* Vertical tab strip */}
      <div className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2">
        {VERTICALS.map((v) => {
          const Icon = v.icon;
          const isActive = v.id === activeId;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setActiveId(v.id)}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors ${
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-primary-border bg-neutral-surface text-ink hover:border-primary/50"
              }`}
            >
              <Icon size={16} strokeWidth={2} />
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Live mock — swaps to the vertical's specific panel */}
      <div className="mx-auto mt-10 max-w-4xl">
        <p className="mb-3 flex items-center justify-center gap-2 font-mono text-[12px] uppercase tracking-[0.08em] text-primary">
          <ActiveIcon size={14} /> {active.label} dashboard
        </p>
        <p className="mx-auto mb-6 max-w-xl text-center text-[15px] text-content-secondary">
          {active.promise}
        </p>
        <Frame url={`${active.id}-business.conddo.io`}>
          <div className="p-5 sm:p-6">
            <ActiveBody />
          </div>
        </Frame>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------
// Per-vertical panel bodies. Each is a small, specific scene that proves
// "this product knows what your industry actually does." All use existing
// design tokens + Chip — no new design system.
// ---------------------------------------------------------------------------

function FashionBody() {
  const orders = [
    { id: "#1042", name: "Adaeze — Asoebi (4-piece)", measure: "Bust 38 · Hips 44", stage: "Cutting" },
    { id: "#1039", name: "Tunde — 3pc Agbada",        measure: "Chest 42 · Length 56", stage: "Stitching" },
    { id: "#1036", name: "Ngozi — Gele set",          measure: "Head circ. 22",       stage: "Ready" },
  ];
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Tile label="In production" value="11" />
        <Tile label="Fittings this week" value="6" />
        <Tile label="Fabric SKUs" value="48" />
      </div>
      <p className="mb-3 text-[12px] font-medium text-ink">Active jobs</p>
      <ul className="space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-content-muted">{o.id}</span>
                <span className="text-[13px] text-ink">{o.name}</span>
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-content-muted">{o.measure}</p>
            </div>
            <Chip tone={o.stage === "Ready" ? "primary" : "warning"}>{o.stage}</Chip>
          </li>
        ))}
      </ul>
    </>
  );
}

function PharmacyBody() {
  const items = [
    { name: "Paracetamol 500mg", nafdac: "A4-1234", expiry: "Sep 2027", qty: "240", tone: "neutral" as const, label: "OK" },
    { name: "Amoxicillin 500mg", nafdac: "A4-2341", expiry: "Feb 2026", qty: "12",  tone: "warning" as const, label: "Low + expiring" },
    { name: "Vitamin C 1000mg",  nafdac: "B7-9921", expiry: "Dec 2025", qty: "48",  tone: "danger" as const,  label: "Expires soon" },
  ];
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Tile label="SKUs on hand" value="612" />
        <Tile label="Expiring < 60d" value="9" toneDanger />
        <Tile label="Prescriptions today" value="34" />
      </div>
      <p className="mb-3 text-[12px] font-medium text-ink">Stock alerts</p>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.name} className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-2.5">
            <div>
              <p className="text-[13px] text-ink">{i.name}</p>
              <p className="font-mono text-[11px] text-content-muted">NAFDAC {i.nafdac} · Exp {i.expiry}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[13px] font-medium text-ink">{i.qty}</p>
              <Chip tone={i.tone}>{i.label}</Chip>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function LogisticsBody() {
  const trips = [
    { id: "TRP-204", driver: "Emeka",  route: "Ikeja → Lekki",    load: "8 parcels",   tone: "info" as const,    stage: "En route" },
    { id: "TRP-203", driver: "Adamu",  route: "Apapa → Ikoyi",    load: "1 pallet",    tone: "warning" as const, stage: "Loading" },
    { id: "TRP-202", driver: "Ifeoma", route: "Surulere → V.I.",  load: "12 parcels",  tone: "success" as const, stage: "Delivered" },
  ];
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Tile label="Trips today" value="18" />
        <Tile label="Drivers on duty" value="6" />
        <Tile label="On-time rate" value="94%" toneSuccess />
      </div>
      <p className="mb-3 text-[12px] font-medium text-ink">Live trips</p>
      <ul className="space-y-2">
        {trips.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-content-muted">{t.id}</span>
                <span className="text-[13px] text-ink">{t.driver}</span>
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-content-muted">{t.route} · {t.load}</p>
            </div>
            <Chip tone={t.tone}>{t.stage}</Chip>
          </li>
        ))}
      </ul>
    </>
  );
}

function FoodBody() {
  const tickets = [
    { table: "Table 4",  items: "2× Jollof, 1× Suya",         time: "3 min", tone: "warning" as const, stage: "In kitchen" },
    { table: "Takeaway", items: "1× Grilled tilapia, sides",  time: "8 min", tone: "info" as const,    stage: "Plating" },
    { table: "Table 1",  items: "3× Egusi soup, pounded yam", time: "—",     tone: "success" as const, stage: "Served" },
  ];
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Tile label="Covers today" value="84" />
        <Tile label="Avg ticket" value="₦9.4k" />
        <Tile label="Ingredients low" value="3" toneDanger />
      </div>
      <p className="mb-3 text-[12px] font-medium text-ink">Kitchen tickets</p>
      <ul className="space-y-2">
        {tickets.map((t) => (
          <li key={t.table + t.items} className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-2.5">
            <div>
              <p className="text-[13px] text-ink">{t.table}</p>
              <p className="mt-0.5 font-mono text-[11px] text-content-muted">{t.items}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] text-content-muted">{t.time}</p>
              <Chip tone={t.tone}>{t.stage}</Chip>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function ConsultingBody() {
  const clients = [
    { name: "Bola Holdings",     retainer: "₦450k/mo",        hours: "12.5 / 40 hrs", tone: "primary" as const, status: "Active" },
    { name: "Lagos State T&E",   retainer: "Project · ₦1.2M", hours: "Scope locked",  tone: "warning" as const, status: "Awaiting sign-off" },
    { name: "EcoFresh Foods",    retainer: "₦280k/mo",        hours: "36 / 32 hrs",   tone: "danger" as const,  status: "Over-budget" },
  ];
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Tile label="Active retainers" value="7" />
        <Tile label="Hours this month" value="184" />
        <Tile label="Invoiced" value="₦3.4M" toneSuccess />
      </div>
      <p className="mb-3 text-[12px] font-medium text-ink">Clients</p>
      <ul className="space-y-2">
        {clients.map((c) => (
          <li key={c.name} className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-2.5">
            <div>
              <p className="text-[13px] text-ink">{c.name}</p>
              <p className="mt-0.5 font-mono text-[11px] text-content-muted">{c.retainer} · {c.hours}</p>
            </div>
            <Chip tone={c.tone}>{c.status}</Chip>
          </li>
        ))}
      </ul>
    </>
  );
}

function RetailBody() {
  const items = [
    { sku: "SKU-4012", name: "Slim-fit jeans · 32",    store: "Ikeja",    qty: "24", tone: "neutral" as const, label: "OK" },
    { sku: "SKU-2218", name: "Cotton tee · L white",   store: "Lekki",    qty: "4",  tone: "warning" as const, label: "Reorder" },
    { sku: "SKU-3301", name: "Leather belt · 36",      store: "Surulere", qty: "0",  tone: "danger" as const,  label: "Out of stock" },
  ];
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Tile label="SKUs across stores" value="1,284" />
        <Tile label="Today's sales" value="₦284k" />
        <Tile label="Supplier orders due" value="2" />
      </div>
      <p className="mb-3 text-[12px] font-medium text-ink">Inventory</p>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i.sku} className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-2.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-content-muted">{i.sku}</span>
                <span className="text-[13px] text-ink">{i.name}</span>
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-content-muted">{i.store}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[13px] font-medium text-ink">{i.qty}</p>
              <Chip tone={i.tone}>{i.label}</Chip>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function EventsBody() {
  const tickets = [
    { tier: "VIP",        sold: "84 / 100",  revenue: "₦4.2M", tone: "success" as const, label: "Almost full" },
    { tier: "Regular",    sold: "362 / 500", revenue: "₦5.4M", tone: "primary" as const, label: "Selling" },
    { tier: "Early bird", sold: "200 / 200", revenue: "₦2.0M", tone: "neutral" as const, label: "Sold out" },
  ];
  return (
    <>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Tile label="Event capacity" value="800" />
        <Tile label="Tickets sold" value="646" />
        <Tile label="Vendors confirmed" value="14 / 16" />
      </div>
      <p className="mb-3 text-[12px] font-medium text-ink">Ticket tiers</p>
      <ul className="space-y-2">
        {tickets.map((t) => (
          <li key={t.tier} className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-surface px-3.5 py-2.5">
            <div>
              <p className="text-[13px] text-ink">{t.tier}</p>
              <p className="mt-0.5 font-mono text-[11px] text-content-muted">{t.sold} sold · {t.revenue}</p>
            </div>
            <Chip tone={t.tone}>{t.label}</Chip>
          </li>
        ))}
      </ul>
    </>
  );
}

// Shared small stat tile used across all vertical bodies.
function Tile({ label, value, toneSuccess, toneDanger }: {
  label: string; value: string; toneSuccess?: boolean; toneDanger?: boolean;
}) {
  const valueClass = toneSuccess ? "text-success" : toneDanger ? "text-danger" : "text-ink";
  return (
    <div className="rounded-lg border border-neutral-border bg-neutral-surface p-3">
      <p className="mb-1 text-[11px] text-content-muted">{label}</p>
      <p className={`font-mono text-lg font-medium leading-none ${valueClass}`}>{value}</p>
    </div>
  );
}
