import type { Metadata } from "next";
import {
  Cross, Pill, Stethoscope, Activity, ClipboardPlus, Bell, FileText, Package,
} from "lucide-react";
import { VerticalLanding, type VerticalSpec } from "@/components/marketing/VerticalLanding";

export const metadata: Metadata = {
  title: "Conddo for Pharmacy",
  description:
    "Prescriptions, EMR, drug programs, refill reminders, NAFDAC + expiry tracking, POS. Everything a Nigerian pharmacy needs in one workspace.",
};

const spec: VerticalSpec = {
  slug: "pharmacy",
  eyebrow: "Conddo for Pharmacy",
  headline: "The operating system for the modern Nigerian pharmacy.",
  lede: "Dispense faster, track expiry properly, build a real patient relationship — and never lose a customer because a prescription got missed. From the counter to the EMR, in one workspace.",
  signupHref: "/onboarding/create-account?vertical=pharmacy",
  modules: [
    {
      icon: ClipboardPlus,
      eyebrow: "Prescriptions",
      title: "Dispense from prescription, every time.",
      description: "Doctor-written prescriptions captured, dispensed, and counter-signed. No more loose papers. Walk-in or web-prescribed, the workflow's the same.",
    },
    {
      icon: Activity,
      eyebrow: "EMR",
      title: "Patient records that travel with the patient.",
      description: "Allergies, chronic conditions, vaccinations, lab uploads, clinical notes. Immutable history per patient — the pharmacist always sees the full picture.",
    },
    {
      icon: Pill,
      eyebrow: "Drug Programs",
      title: "Chronic care, on autopilot.",
      description: "Bundle products + monthly consultations + reminders into a subscription patients enrol on. Bills via Paystack. Frees up your team and locks in recurring revenue.",
    },
    {
      icon: Bell,
      eyebrow: "Refill reminders",
      title: "Don't lose a patient to forgetfulness.",
      description: "Conddo nudges patients before their refill is due. SMS, WhatsApp, or in-app. Conversion rate beats every social channel.",
    },
    {
      icon: Package,
      eyebrow: "Inventory",
      title: "NAFDAC, batch, expiry — handled.",
      description: "Batch numbers and expiry dates per SKU. Expiring-soon alerts. Bulk CSV upload with a dry-run preview before commit. Built for high-SKU retail pharmacy.",
    },
    {
      icon: Stethoscope,
      eyebrow: "Consultations",
      title: "Sell consultations, not just drugs.",
      description: "Bookable consultation slots, video or in-person, with prescription generation that flows straight back into dispensing. Higher margin than over-the-counter alone.",
    },
    {
      icon: FileText,
      eyebrow: "POS",
      title: "Walk-in sales that match your books.",
      description: "Open shift, run sales, take cash or transfer, close with reconciliation. Cashiers see only POS — no analytics, no patient records.",
    },
    {
      icon: Cross,
      eyebrow: "Cashback Loyalty",
      title: "Repeat customers become regulars.",
      description: "Configurable cashback % per order. Patients redeem on their next visit. Drives a measurable lift in repeat-buyer rate without you running a campaign.",
    },
  ],
  scenario: {
    title: "A Tuesday morning at Wellspring Pharmacy",
    paragraphs: [
      "Mrs Adebayo opens her phone at 7:30am. Three refill reminders went out overnight — two patients have already replied to confirm. She marks both as 'expected today'.",
      "Her pharmacist arrives, opens /work/clinical, sees the prescription queue. Three from yesterday's online orders, two flagged by the EMR as 'allergy check needed'. She dispenses, prints the receipt, hands it over.",
      "Her cashier opens shift, runs walk-in sales. POS only — she can't accidentally open the analytics page or change a price. By midday she's processed 14 transactions, ₦87,400 collected, and the cash drawer reconciles to the naira.",
      "By 6pm Mrs Adebayo opens analytics. Revenue's up 22% on last Tuesday. Two patients in the Diabetes Care Program just had their monthly billing run successfully. Three new patients enrolled in cashback loyalty this week.",
      "She closes the laptop. The pharmacy ran itself today.",
    ],
  },
  stats: [
    { label: "Repeat rate lift", value: "+38%" },
    { label: "Avg. checkout time", value: "47s" },
    { label: "Prescriptions / day", value: "60+" },
    { label: "Setup time", value: "12 min" },
  ],
};

export default function PharmacyVerticalPage() {
  return <VerticalLanding spec={spec} />;
}
