import { Shirt, Cross, Briefcase, Truck, UtensilsCrossed, ShoppingBag } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";

// Step 2 — Business Type (PRD §15.1). Visual grid of verticals.
// MVP verticals are selectable; the rest are marked coming soon.
// Placeholder — selection state + exact list come from the Stitch design + vertical config.
const verticals = [
  { id: "fashion", label: "Fashion & Tailoring", icon: Shirt, live: true },
  { id: "pharmacy", label: "Pharmacy & Health", icon: Cross, live: true },
  { id: "professional", label: "Professional Services", icon: Briefcase, live: true },
  { id: "logistics", label: "Logistics & Delivery", icon: Truck, live: false },
  { id: "food", label: "Food & Beverage", icon: UtensilsCrossed, live: false },
  { id: "retail", label: "Retail", icon: ShoppingBag, live: false },
];

export default function BusinessTypeStep() {
  return (
    <StepShell slug="business-type">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {verticals.map(({ id, label, icon: Icon, live }) => (
          <div
            key={id}
            className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${
              live
                ? "cursor-pointer border-neutral-border bg-neutral-surface hover:border-primary hover:bg-primary-bg/40"
                : "border-neutral-border bg-neutral-surface2 opacity-60"
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                live ? "bg-primary-bg text-primary" : "bg-neutral-border text-content-muted"
              }`}
            >
              <Icon size={20} strokeWidth={2} />
            </span>
            <div>
              <p className="text-[14px] font-medium text-ink">{label}</p>
              {!live && (
                <p className="font-mono text-[11px] text-content-muted">Coming soon</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </StepShell>
  );
}
