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
  Headphones,
  MoreHorizontal,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useOnboarding } from "@/lib/onboarding-store";
import { hrefFor, nextStep } from "@/lib/onboarding-steps";

type Vertical = { id: string; label: string; desc: string; icon: LucideIcon };

// IDs must match the canonical vertical slugs the BE Module Registry keys
// manifests by — see lib/verticalCopy.ts → VerticalId and the registry
// returns from /api/v1/registry/manifests. Anything else here is sent to BE
// as a verticalId but won't have a vertical-specific manifest; the sidebar
// falls back to the generic APP_NAV.
const verticals: Vertical[] = [
  { id: "fashion", label: "Fashion and Tailoring", desc: "Custom outfits, measurements, orders", icon: Shirt },
  { id: "pharmacy", label: "Pharmacy and Health", desc: "Inventory, prescriptions, walk-in customers", icon: Pill },
  { id: "music-studio", label: "Music Studio", desc: "Sessions, bookings, deposits", icon: Headphones },
  { id: "food-and-beverage", label: "Food and Beverage", desc: "Menu, orders, table management", icon: UtensilsCrossed },
  { id: "logistics", label: "Logistics and Delivery", desc: "Dispatch, tracking, deliveries", icon: Truck },
  { id: "professional-services", label: "Professional Services", desc: "Consultations, bookings, documents", icon: Briefcase },
  { id: "retail", label: "Retail and Shop", desc: "Products, inventory, walk-in sales", icon: Store },
  { id: "beauty-and-wellness", label: "Beauty and Wellness", desc: "Appointments, staff, services", icon: Sparkles },
  { id: "events", label: "Events and Entertainment", desc: "Ticketing, registrations, planning", icon: Ticket },
  { id: "realestate", label: "Real Estate", desc: "Listings, viewings, buyer management", icon: Building2 },
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
        <p className="mt-2 text-[16px] text-white/65">
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
                  ? "border-2 border-primary bg-primary/[0.08]"
                  : "border border-white/[0.06] bg-cinema-elev hover:border-primary hover:bg-cinema-base"
              }`}
            >
              {isSelected && (
                <CircleCheck
                  size={22}
                  className="absolute right-4 top-4 fill-primary text-white"
                />
              )}
              <Icon size={32} strokeWidth={1.75} className="mb-4 text-primary" />
              <h3 className="mb-1 text-[16px] font-medium text-white">{label}</h3>
              <p className="text-[14px] leading-tight text-white/65">{desc}</p>
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
