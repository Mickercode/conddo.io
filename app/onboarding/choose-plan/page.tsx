import { Check } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";

// Step 4 — Choose Plan (PRD §15.1). Pricing per PRD §14 (Subscription model).
// NOTE: the marketing landing page currently shows ₦25k/45k/80k — reconcile
// which pricing is canonical before launch. Placeholder selection UI.
const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "₦15,000",
    features: ["Website", "CRM", "Payments", "Analytics"],
  },
  {
    id: "business",
    name: "Business",
    price: "₦35,000",
    popular: true,
    features: ["Everything in Starter", "Bookings & Orders", "Social scheduler", "Email & SMS"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₦65,000",
    features: ["Everything in Business", "Ad Manager", "API access", "Priority support"],
  },
];

export default function ChoosePlanStep() {
  return (
    <StepShell slug="choose-plan" continueLabel="Start free trial">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col rounded-lg bg-neutral-surface p-5 ${
              plan.popular ? "border-2 border-primary" : "border border-neutral-border"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-2.5 left-5 inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                Popular
              </span>
            )}
            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-content-secondary">
              {plan.name}
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-mono text-[24px] font-medium leading-none text-ink">
                {plan.price}
              </span>
              <span className="text-[13px] text-content-muted">/mo</span>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13px] text-content-secondary">
                  <Check size={15} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-[14px] text-content-secondary">
        14-day free trial on all plans. No card charged today.
      </p>
    </StepShell>
  );
}
