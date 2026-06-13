import {
  Globe, Users, ShoppingCart, Wallet, Package, Megaphone, BarChart3, IdCard,
} from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { BentoGrid, BentoCard } from "./BentoGrid";
import { SectionHeader } from "./SectionHeader";

/** Home page bento — the high-level "what you get" overview. Each card
 *  links to the deeper section on /product or a dedicated subpage. Cards
 *  are sized by importance: the website + customers + analytics are the
 *  hero modules so they get more weight; staff + payments share a row of
 *  small cells. */
export function HomeBento() {
  return (
    <section className="bg-neutral-bg py-20 md:py-28">
      <div className="container-x">
        <SectionHeader
          eyebrow="One platform"
          title={<>Every tool your business needs, <span className="text-primary">built to fit together</span>.</>}
          lede="No more juggling spreadsheets, WhatsApp groups, and three different apps. Conddo gives you one workspace where your website, sales, and customers live in one place."
        />

        <BentoGrid>
          <BentoCard
            span="lg"
            height="tall"
            icon={Globe}
            eyebrow="Website"
            title="A website that sells, not just sits there"
            description="Your storefront, built in minutes. Take orders, accept payments, capture leads — all on a fast, SEO-friendly site that lives on your own subdomain."
            href="/product#website"
          >
            <MockWebsite />
          </BentoCard>

          <BentoCard
            span="sm"
            height="tall"
            icon={Users}
            eyebrow="Customers"
            title="A real CRM, not a contact list"
            description="See every order, conversation, and visit per customer. Tag, segment, and reach back out when it matters."
            href="/product#customers"
          />

          <BentoCard
            span="sm"
            icon={ShoppingCart}
            title="Orders & Bookings"
            description="One inbox for every sale and appointment."
            href="/product#orders"
          />

          <BentoCard
            span="sm"
            icon={Wallet}
            title="Naira payments"
            description="Paystack + Routepay. Local-first, no card juggling."
            href="/product#payments"
          />

          <BentoCard
            span="sm"
            icon={BarChart3}
            title="Know what works"
            description="Revenue, top products, customer trends — at a glance."
            href="/product#analytics"
          />

          <BentoCard
            span="md"
            icon={Package}
            title="Inventory that keeps up"
            description="Stock counts, low-stock alerts, bulk CSV upload, batch tracking. Built for the way Nigerian shops actually run."
            href="/product#inventory"
          />

          <BentoCard
            span="md"
            icon={Megaphone}
            title="Marketing on autopilot"
            description="Loyalty cashback, drug programs, refill reminders, discounts — turn one-time buyers into repeat customers without lifting a finger."
            href="/product#marketing"
          >
            <Chip tone="success">+38% repeat rate</Chip>
          </BentoCard>

          <BentoCard
            span="full"
            icon={IdCard}
            title="Bring your team — with the right access"
            description="Owners run the workspace. Cashiers, pharmacists, stock managers, and bookkeepers each see only what they need. No more shared logins, no more accidental deletions."
            href="/product#staff"
          >
            <div className="flex flex-wrap gap-2">
              <Chip tone="neutral">Manager</Chip>
              <Chip tone="neutral">Pharmacist</Chip>
              <Chip tone="neutral">Cashier</Chip>
              <Chip tone="neutral">Stock Manager</Chip>
              <Chip tone="neutral">Bookkeeper</Chip>
            </div>
          </BentoCard>
        </BentoGrid>
      </div>
    </section>
  );
}

/** Inline mock of a website thumbnail — used inside the lg Website card.
 *  Pure CSS, no asset weight. Keeps the bento feeling alive without an
 *  expensive image. */
function MockWebsite() {
  return (
    <div className="relative h-32 overflow-hidden rounded-lg border border-neutral-border bg-neutral-surface2 md:h-40">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-bg to-neutral-surface2" />
      <div className="absolute inset-x-3 top-3 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-strong" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-strong" />
        <span className="h-1.5 w-1.5 rounded-full bg-neutral-strong" />
        <span className="ml-2 h-3 flex-1 rounded bg-white/70" />
      </div>
      <div className="absolute inset-x-3 top-10 space-y-1.5">
        <span className="block h-2 w-2/3 rounded bg-ink/80" />
        <span className="block h-2 w-1/2 rounded bg-ink/60" />
      </div>
      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-1.5">
        <span className="h-6 rounded bg-white/80" />
        <span className="h-6 rounded bg-white/80" />
        <span className="h-6 rounded bg-white/80" />
      </div>
    </div>
  );
}
