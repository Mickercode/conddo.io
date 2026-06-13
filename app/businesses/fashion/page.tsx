import type { Metadata } from "next";
import {
  Shirt, Ruler, Layers, ShoppingBag, Sparkles, Camera, Calendar, MessageCircle,
} from "lucide-react";
import { VerticalLanding, type VerticalSpec } from "@/components/marketing/VerticalLanding";

export const metadata: Metadata = {
  title: "Conddo for Fashion",
  description:
    "Measurements, fabric tracking, fitting schedules, lookbooks, social-ready website. The fashion brand workspace built for Naija designers.",
};

const spec: VerticalSpec = {
  slug: "fashion",
  eyebrow: "Conddo for Fashion",
  headline: "Run your label like the brand it deserves to be.",
  lede: "From measurements and fittings to fabric tracking and Instagram-ready lookbooks — Conddo gives Nigerian fashion brands the workspace they've been faking in spreadsheets and DMs.",
  signupHref: "/onboarding/create-account?vertical=fashion",
  modules: [
    {
      icon: Ruler,
      eyebrow: "Measurements",
      title: "One profile per client. Forever.",
      description: "Full measurement set captured once, updated as bodies change. Your tailors get exactly the measurements they need, in the format they expect. No more 'what's her hip again?'",
    },
    {
      icon: Layers,
      eyebrow: "Fabric tracking",
      title: "Yardage in, garments out.",
      description: "Track every roll: vendor, yardage, cost, where it went. When a client asks 'is that fabric still available?', you know in three seconds.",
    },
    {
      icon: Calendar,
      eyebrow: "Fittings",
      title: "Fittings that don't ghost.",
      description: "Stage-based workflow: measurement → cutting → first fitting → second fitting → ready. Clients get SMS reminders. Your team sees what's due this week.",
    },
    {
      icon: ShoppingBag,
      eyebrow: "Storefront",
      title: "A website that looks like your brand.",
      description: "Mobile-first, lookbook-ready, with a checkout that takes naira and a booking flow for bespoke. No Instagram bio link drama.",
    },
    {
      icon: Camera,
      eyebrow: "Lookbook",
      title: "Image-led product catalog.",
      description: "Upload photos, tag them with the dress, the fabric, the price. Customers scroll, save, and DM you ready to buy.",
    },
    {
      icon: MessageCircle,
      eyebrow: "Customer profiles",
      title: "Every conversation in one place.",
      description: "Order history, last fitting, fabric preferences, the colour she's allergic to. Customer service stops being 'who is this again?'",
    },
    {
      icon: Sparkles,
      eyebrow: "Marketing",
      title: "Loyalty for the customer who buys six aso-ebi a year.",
      description: "Configurable cashback. Repeat-customer recognition. The kind of polish that makes premium pricing feel earned.",
    },
    {
      icon: Shirt,
      eyebrow: "Bookings",
      title: "Customers book themselves in.",
      description: "Self-serve booking widget on your site. Slots for fittings, consultations, deliveries. Calendar syncs with your team.",
    },
  ],
  scenario: {
    title: "A Friday at House of Adetola",
    paragraphs: [
      "Adetola opens her phone over coffee. Three new bookings overnight — two fittings, one consultation. She approves them with one tap.",
      "Her studio manager opens the dashboard. Today's fitting list: six clients, four in second-fitting stage, two in first. She prints the cutting sheets with each client's exact measurements pre-filled — nothing handwritten, nothing wrong.",
      "By 11am a regular client DMs asking if the green Aso-Oke is still in stock. Adetola opens the fabric tracker — 4.2 yards left, enough for the wedding dress. She confirms in WhatsApp without leaving Conddo.",
      "Late afternoon, she posts the new bridal lookbook to Instagram. Three sales come in through the storefront within the hour, two new customers join her loyalty program.",
      "She closes the laptop. The studio looks like a fashion house, not a side hustle.",
    ],
  },
  stats: [
    { label: "Faster fittings", value: "3x" },
    { label: "Avg. order value", value: "₦185k" },
    { label: "Repeat client rate", value: "62%" },
    { label: "Setup time", value: "10 min" },
  ],
};

export default function FashionVerticalPage() {
  return <VerticalLanding spec={spec} />;
}
