"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shirt,
  Pill,
  UtensilsCrossed,
  Truck,
  Briefcase,
  Store,
  Ticket,
  Building2,
  Sparkles,
  GraduationCap,
  Stethoscope,
  MoreHorizontal,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep } from "@/lib/onboarding-steps";

type Vertical = { id: string; label: string; desc: string; icon: LucideIcon };

// Built from the Stitch "Business Type Selection" screen.
const verticals: Vertical[] = [
  { id: "fashion", label: "Fashion and Tailoring", desc: "Custom outfits, measurements, orders", icon: Shirt },
  { id: "pharmacy", label: "Pharmacy and Health", desc: "Inventory, prescriptions, walk-in customers", icon: Pill },
  { id: "food", label: "Food and Beverage", desc: "Menu, orders, table management", icon: UtensilsCrossed },
  { id: "logistics", label: "Logistics and Delivery", desc: "Dispatch, tracking, deliveries", icon: Truck },
  { id: "professional", label: "Professional Services", desc: "Consultations, bookings, documents", icon: Briefcase },
  { id: "retail", label: "Retail and Shop", desc: "Products, inventory, walk-in sales", icon: Store },
  { id: "events", label: "Events and Entertainment", desc: "Ticketing, registrations, planning", icon: Ticket },
  { id: "realestate", label: "Real Estate", desc: "Listings, viewings, buyer management", icon: Building2 },
  { id: "beauty", label: "Beauty and Wellness", desc: "Appointments, staff, services", icon: Sparkles },
  { id: "education", label: "Education and Training", desc: "Courses, enrolment, scheduling", icon: GraduationCap },
  { id: "healthcare", label: "Healthcare and Clinic", desc: "Patients, appointments, records", icon: Stethoscope },
  { id: "other", label: "Other Business", desc: "We will set you up manually", icon: MoreHorizontal },
];

export default function BusinessTypeStep() {
  const router = useRouter();
  const { verticalId, update } = useOnboarding();
  const [selected, setSelected] = useState<string | null>(verticalId ?? "fashion");

  const onContinue = () => {
    update({ verticalId: selected });
    const next = nextStep("business-type");
    if (next) router.push(hrefFor(next.slug));
  };

  return (
    <>
      <header className="mb-10 text-center">
        <h1 className="text-[28px] leading-tight tracking-[-0.02em] md:text-[32px]">
          What kind of business do you run?
        </h1>
        <p className="mt-2 text-[16px] text-content-secondary">
          We set everything up based on your answer.
        </p>
      </header>

      <section className="mb-10 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {verticals.map(({ id, label, desc, icon: Icon }) => {
          const isSelected = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setSelected(id)}
              className={`relative rounded-xl p-6 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isSelected
                  ? "border-2 border-primary bg-primary-bg"
                  : "border border-neutral-border bg-neutral-surface hover:border-primary hover:bg-neutral-bg"
              }`}
            >
              {isSelected && (
                <CircleCheck
                  size={22}
                  className="absolute right-4 top-4 fill-primary text-white"
                />
              )}
              <Icon size={32} strokeWidth={1.75} className="mb-4 text-primary" />
              <h3 className="mb-1 text-[16px] font-medium text-ink">{label}</h3>
              <p className="text-[14px] leading-tight text-content-secondary">{desc}</p>
            </button>
          );
        })}
      </section>

      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <Button onClick={onContinue} variant="primary" size="lg" className="w-full">
          Continue
        </Button>
        <a href="#" className="text-[14px] text-primary hover:underline">
          Don&apos;t see your business type? Tell us.
        </a>
      </div>
    </>
  );
}
