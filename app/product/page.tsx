import type { Metadata } from "next";
import type { ComponentType } from "react";
import Link from "next/link";
import {
  Globe, ClipboardList, Wallet, Megaphone, BarChart3, ArrowRight, IdCard,
  Package, Users, Sparkles, type LucideIcon,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { WebsiteMock } from "@/components/mocks/WebsiteMock";
import { OperationsMock } from "@/components/mocks/OperationsMock";
import { PaymentsMock } from "@/components/mocks/PaymentsMock";
import { MarketingMock } from "@/components/mocks/MarketingMock";
import { AnalyticsMock } from "@/components/mocks/AnalyticsMock";
import { FinalCTA } from "@/components/FinalCTA";

export const metadata: Metadata = {
  title: "Product — Conddo.io",
  description:
    "Every Conddo.io module in detail: website, customers, orders, inventory, payments, marketing, analytics, staff. Built for Nigerian businesses.",
};

type Feature = {
  anchor: string;
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  body: string;
  bullets: string[];
  Mock: ComponentType;
};

/** Each feature has its own anchored block so the bento on the home page
 *  can deep-link straight to the relevant detail. Anchors match the home
 *  bento's `href` props (e.g. /product#website). */
const features: Feature[] = [
  {
    anchor: "website",
    eyebrow: "Website",
    icon: Globe,
    title: "A website that sells, not just sits there.",
    body: "Live in minutes on your own subdomain. Take orders, accept Naira payments, capture leads. Built-in SEO, fast on 3G, looks right on every phone.",
    bullets: [
      "Custom subdomain free, custom domain on Growth+",
      "Bookings, products, or services — your pick",
      "Built-in checkout (Paystack + Routepay)",
      "Mobile-first, SEO-friendly, fast on 3G",
    ],
    Mock: WebsiteMock,
  },
  {
    anchor: "customers",
    eyebrow: "Customers",
    icon: Users,
    title: "A real CRM, not a contact list.",
    body: "Every order, conversation, and visit per customer. Tag, segment, and reach back out when it matters. The customer detail page tells you everything before you pick up the phone.",
    bullets: [
      "Full order + payment history per customer",
      "Tag + segment by behaviour or vertical",
      "EMR-ready for clinical verticals (pharmacy)",
      "WhatsApp + SMS + email contact, one click",
    ],
    Mock: OperationsMock,
  },
  {
    anchor: "orders",
    eyebrow: "Orders & Bookings",
    icon: ClipboardList,
    title: "One inbox for every sale.",
    body: "Web orders, walk-ins, bookings, prescriptions — everything flows into one workspace. Status tracking, fulfilment stages, and a clear handoff to the right team member.",
    bullets: [
      "Stage workflows per vertical",
      "Walk-in via POS, online via website",
      "Bookings calendar with reminders",
      "Receipt printing + WhatsApp send",
    ],
    Mock: OperationsMock,
  },
  {
    anchor: "inventory",
    eyebrow: "Inventory",
    icon: Package,
    title: "Stock that keeps up with you.",
    body: "Live counts, low-stock alerts, batch tracking, bulk CSV upload. Reconciliations that don't take a Saturday. Built for the way Nigerian shops actually run.",
    bullets: [
      "Bulk CSV upload — preview before commit",
      "Low-stock alerts (configurable threshold)",
      "Batch numbers + expiry (pharmacy)",
      "Movement log — every change auditable",
    ],
    Mock: OperationsMock,
  },
  {
    anchor: "payments",
    eyebrow: "Payments",
    icon: Wallet,
    title: "Get paid in Naira, fast.",
    body: "Paystack for online + subscriptions; Routepay for in-person, deposits, and walk-ins. Automatic receipts. One ledger across both rails. No dollar card.",
    bullets: [
      "Paystack: cards, transfer, USSD",
      "Routepay: in-person + deposits",
      "Auto-invoices and receipts",
      "Reconciliation log per payout",
    ],
    Mock: PaymentsMock,
  },
  {
    anchor: "marketing",
    eyebrow: "Marketing",
    icon: Megaphone,
    title: "More customers, fewer apps.",
    body: "Loyalty cashback, drug programs, follow-ups, discounts, refill offers — turn one-time buyers into repeat customers without lifting a finger. Schedule social posts and ads from the same dashboard.",
    bullets: [
      "Cashback loyalty (configurable %)",
      "Drug programs with monthly billing",
      "SMS + email + WhatsApp campaigns",
      "Schedule Instagram / Facebook ads",
    ],
    Mock: MarketingMock,
  },
  {
    anchor: "analytics",
    eyebrow: "Analytics",
    icon: BarChart3,
    title: "Know what's actually working.",
    body: "Revenue, best-sellers, customer trends, repeat-buyer rate — at a glance, in one dashboard. Export to CSV for the accountant. Decisions on numbers, not guesswork.",
    bullets: [
      "Revenue trend + delta vs last period",
      "Top products + categories",
      "Customer cohort + retention",
      "CSV export for accounting",
    ],
    Mock: AnalyticsMock,
  },
  {
    anchor: "staff",
    eyebrow: "Staff",
    icon: IdCard,
    title: "Bring your team — with the right access.",
    body: "Cashier, pharmacist, stock manager, bookkeeper, manager — each sees only what they need. No shared logins, no accidental deletions. Onboarding takes a minute.",
    bullets: [
      "Five role presets (5-role catalogue)",
      "Plan-gated seat count (Launcher 2 / Growth 5 / Scaler ∞)",
      "Invite via email; staff set their own password",
      "Module-level access (read / write / none)",
    ],
    Mock: AnalyticsMock,
  },
];

export default function ProductPage() {
  return (
    <MarketingShell>
      {/* Hero strip — dark mini-hero so the page reads as a continuation of
          the marketing surface and not a generic content page. */}
      <section className="marketing-hero-dark relative overflow-hidden">
        <div className="marketing-hero-dark-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-primary-light backdrop-blur">
              <Sparkles size={11} className="text-primary-light" />
              Product overview
            </span>
            <h1 className="text-balance text-[42px] font-medium leading-[1.05] tracking-[-0.02em] text-white md:text-[56px]">
              One workspace. Every part of your business.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[17px] leading-relaxed text-white/70">
              Eight modules that work together out of the box — website, customers, orders, inventory, payments, marketing, analytics, and your team. Built for Nigerian businesses, in Naira, for the way you actually run.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {features.map((f) => (
                <a
                  key={f.anchor}
                  href={`#${f.anchor}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/80 transition-colors hover:border-white/30 hover:text-white"
                >
                  <f.icon size={12} />
                  {f.eyebrow}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature deep-dive sections — alternating layout for visual rhythm. */}
      <div className="bg-neutral-bg">
        <div className="container-x space-y-20 py-20 md:space-y-28 md:py-28">
          {features.map(({ anchor, eyebrow, icon: Icon, title, body, bullets, Mock }, i) => {
            const reverse = i % 2 === 1;
            return (
              <Reveal key={anchor}>
                <section
                  id={anchor}
                  className="grid scroll-mt-24 grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16"
                >
                  <div className={reverse ? "lg:order-2" : ""}>
                    <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary-bg">
                      <Icon size={20} className="text-primary" strokeWidth={2} />
                    </span>
                    <span className="marketing-eyebrow">{eyebrow}</span>
                    <h2 className="mt-3 marketing-h2">{title}</h2>
                    <p className="mt-5 max-w-md text-[16px] leading-[1.65] text-content-secondary">
                      {body}
                    </p>
                    <ul className="mt-6 space-y-2.5">
                      {bullets.map((b) => (
                        <li key={b} className="flex items-start gap-2.5 text-[14px] text-ink">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={reverse ? "lg:order-1" : ""}>
                    <div className="overflow-hidden rounded-2xl border border-neutral-border bg-neutral-surface shadow-[0_24px_60px_-30px_rgba(17,17,17,0.25)]">
                      <Mock />
                    </div>
                  </div>
                </section>
              </Reveal>
            );
          })}

          {/* Cross-link to vertical landings */}
          <Reveal>
            <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-8 md:p-10">
              <SectionHeader
                eyebrow="Built for your vertical"
                title="See what Conddo looks like for your kind of business"
                lede="Pharmacy, fashion, music studio, salon, restaurant, consultancy — each vertical gets the right modules, the right copy, and the right defaults."
              />
              <div className="flex flex-wrap gap-2">
                <Chip tone="neutral">Pharmacy</Chip>
                <Chip tone="neutral">Fashion</Chip>
                <Chip tone="neutral">Music Studio</Chip>
                <Chip tone="neutral">Salon</Chip>
                <Chip tone="neutral">Restaurant</Chip>
                <Chip tone="neutral">Consultancy</Chip>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/businesses" variant="primary" size="md">
                  Browse verticals <ArrowRight size={15} />
                </Button>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary hover:underline"
                >
                  See pricing <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <FinalCTA />
    </MarketingShell>
  );
}
