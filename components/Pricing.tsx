import { Check } from "lucide-react";
import { Section, Eyebrow } from "./ui/Section";
import { Button } from "./ui/Button";

type Plan = {
  name: string;
  price: string;
  blurb: string;
  inherits?: string;
  features: string[];
  popular?: boolean;
};

const plans: Plan[] = [
  {
    name: "Starter",
    price: "₦25,000",
    blurb: "Everything to get online and start selling.",
    features: ["Website", "CRM", "Payments", "Analytics"],
  },
  {
    name: "Business",
    price: "₦45,000",
    blurb: "For growing businesses that market actively.",
    inherits: "Everything in Starter, plus",
    features: [
      "Bookings",
      "Order management",
      "Social scheduler",
      "Email & SMS campaigns",
      "Marketing dashboard",
    ],
    popular: true,
  },
  {
    name: "Pro",
    price: "₦80,000",
    blurb: "For established businesses scaling with ads.",
    inherits: "Everything in Business, plus",
    features: [
      "Ad management",
      "API access",
      "Advanced analytics",
      "Priority support",
    ],
  },
];

export function Pricing() {
  return (
    <Section tone="bg" id="pricing">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Pricing</Eyebrow>
        <h2 className="text-[34px] leading-tight tracking-[-0.01em] md:text-[40px]">
          Simple plans. No hidden fees.
        </h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 items-start gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex h-full flex-col rounded-lg bg-neutral-surface p-7 ${
              plan.popular
                ? "border-2 border-primary md:-mt-3 md:pb-9 md:pt-9"
                : "border border-neutral-border"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-7 inline-flex items-center rounded-full bg-primary px-3 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-white">
                ★ Most popular
              </span>
            )}

            <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-content-secondary">
              {plan.name}
            </p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="font-mono text-[36px] font-medium leading-none text-ink">
                {plan.price}
              </span>
              <span className="text-[14px] text-content-muted">/month</span>
            </div>

            <p className="mt-3 text-[14px] leading-relaxed text-content-secondary">
              {plan.blurb}
            </p>

            <div className="my-6 h-px bg-neutral-border" />

            {plan.inherits && (
              <p className="mb-3 text-[13px] font-medium text-ink">
                {plan.inherits}
              </p>
            )}
            <ul className="mb-7 flex-1 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <Check
                    size={17}
                    className="mt-0.5 shrink-0 text-primary"
                    strokeWidth={2.5}
                  />
                  <span className="text-[14px] text-content-secondary">{f}</span>
                </li>
              ))}
            </ul>

            <Button
              href={`/onboarding/create-account?plan=${plan.name.toLowerCase()}`}
              variant={plan.popular ? "primary" : "secondary"}
              size="md"
              className="w-full"
            >
              Start free trial
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-2 text-center">
        <p className="text-[14px] text-content-secondary">
          14-day free trial on all plans. No credit card required.
        </p>
        <span className="inline-flex items-center gap-2 rounded-full bg-success-bg px-3.5 py-1.5 font-mono text-[12px] font-medium text-success">
          Save 2 months on an annual plan
        </span>
      </div>
    </Section>
  );
}
