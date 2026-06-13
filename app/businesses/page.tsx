import type { Metadata } from "next";
import {
  Sparkles, Shirt, Cross, Truck, UtensilsCrossed, Briefcase, ShoppingBag,
  PartyPopper, Music2, type LucideIcon,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SectionHeader } from "@/components/marketing/SectionHeader";
import { BentoGrid, BentoCard } from "@/components/marketing/BentoGrid";
import { FinalCTA } from "@/components/FinalCTA";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Businesses — Conddo.io",
  description:
    "Conddo.io is built vertical by vertical. See what it looks like for pharmacy, fashion, music studio, and more.",
};

type Vertical = {
  id: string;
  label: string;
  icon: LucideIcon;
  promise: string;
  href: string | null;
  status: "live" | "soon";
};

/** The vertical roster. Each row is either:
 *   - `live` — has its own /businesses/<slug> deep-dive landing
 *   - `soon` — vertical-aware backend exists but the marketing landing
 *     isn't built yet, so the card stays on-page without a click target. */
const verticals: Vertical[] = [
  { id: "pharmacy",    label: "Pharmacy",        icon: Cross,           promise: "NAFDAC numbers, expiry tracking, prescriptions, EMR, drug programs.", href: "/businesses/pharmacy",    status: "live" },
  { id: "fashion",     label: "Fashion",         icon: Shirt,           promise: "Measurement profiles, fabric tracking, fittings stages.",              href: "/businesses/fashion",     status: "live" },
  { id: "music-studio", label: "Music Studio",   icon: Music2,          promise: "Session bookings, deposits, room schedules, artist profiles.",          href: "/businesses/music-studio", status: "live" },
  { id: "retail",      label: "Retail",          icon: ShoppingBag,     promise: "SKUs, barcodes, multi-store stock, supplier orders.",                  href: null, status: "soon" },
  { id: "food",        label: "Food & Beverage", icon: UtensilsCrossed, promise: "Menus, kitchen tickets, daily covers, supplier costs.",                href: null, status: "soon" },
  { id: "consulting",  label: "Consulting",      icon: Briefcase,       promise: "Retainers, billable hours, invoices, scope sign-offs.",                href: null, status: "soon" },
  { id: "logistics",   label: "Logistics",       icon: Truck,           promise: "Live route status, delivery proof, fleet load.",                       href: null, status: "soon" },
  { id: "events",      label: "Events",          icon: PartyPopper,     promise: "Ticket types, guest lists, vendors, run-of-show.",                     href: null, status: "soon" },
];

export default function BusinessesPage() {
  const live = verticals.filter((v) => v.status === "live");
  const soon = verticals.filter((v) => v.status === "soon");

  return (
    <MarketingShell>
      <section className="marketing-hero-dark relative overflow-hidden">
        <div className="marketing-hero-dark-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="container-x relative py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-primary-light backdrop-blur">
              <Sparkles size={11} className="text-primary-light" />
              Built vertical by vertical
            </span>
            <h1 className="text-balance text-[42px] font-medium leading-[1.05] tracking-[-0.02em] text-white md:text-[56px]">
              Pick the version of Conddo that fits your business.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[17px] leading-relaxed text-white/70">
              Every vertical gets the right modules turned on, the right copy in the dashboard, and defaults that match how that kind of business actually runs.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-neutral-bg py-20 md:py-28">
        <div className="container-x">
          <SectionHeader
            eyebrow="Live now"
            title="Verticals you can sign up for today"
            lede="These three have the deepest support — full clinical / measurement / scheduling workflows ready out of the box."
          />
          <BentoGrid>
            {live.map((v) => (
              <BentoCard
                key={v.id}
                span="md"
                icon={v.icon}
                eyebrow={v.label}
                title={`Conddo for ${v.label}`}
                description={v.promise}
                href={v.href ?? undefined}
              />
            ))}
          </BentoGrid>

          <div className="mt-20">
            <SectionHeader
              eyebrow="Coming next"
              title="More verticals on the way"
              lede="Generic Conddo modules work for these today — vertical-specific tooling lands next. Sign up for the closest match and you'll get the specialised version automatically as it ships."
            />
            <BentoGrid>
              {soon.map((v) => (
                <BentoCard
                  key={v.id}
                  span="md"
                  icon={v.icon}
                  eyebrow={v.label}
                  title={v.label}
                  description={v.promise}
                />
              ))}
            </BentoGrid>
          </div>
        </div>
      </section>

      <FinalCTA />
    </MarketingShell>
  );
}
