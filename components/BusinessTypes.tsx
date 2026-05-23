import {
  Shirt,
  Cross,
  Truck,
  UtensilsCrossed,
  Briefcase,
  ShoppingBag,
  PartyPopper,
  MoreHorizontal,
} from "lucide-react";
import { Section, Eyebrow } from "./ui/Section";

const types = [
  { label: "Fashion", icon: Shirt },
  { label: "Pharmacy", icon: Cross },
  { label: "Logistics", icon: Truck },
  { label: "Food & Beverage", icon: UtensilsCrossed },
  { label: "Consulting", icon: Briefcase },
  { label: "Retail", icon: ShoppingBag },
  { label: "Events", icon: PartyPopper },
  { label: "and more", icon: MoreHorizontal },
];

export function BusinessTypes() {
  return (
    <Section tone="purple">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Built for your business type</Eyebrow>
        <h2 className="text-[34px] leading-tight tracking-[-0.01em] md:text-[40px]">
          Conddo.io knows your industry.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[16px] leading-[1.7] text-content-secondary">
          Select your business type when you sign up and get a platform
          pre-configured for how your industry works. A pharmacy gets different
          tools from a fashion brand. A logistics company gets different tools
          from a restaurant.
        </p>
      </div>

      <div className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-3">
        {types.map(({ label, icon: Icon }) => (
          <span
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-primary-border bg-neutral-surface px-4 py-2.5 text-[14px] font-medium text-ink"
          >
            <Icon size={16} className="text-primary" strokeWidth={2} />
            {label}
          </span>
        ))}
      </div>
    </Section>
  );
}
