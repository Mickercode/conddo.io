"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { ONBOARDING_STEPS, TOTAL_STEPS } from "@/lib/onboarding-steps";

export function Stepper() {
  const pathname = usePathname();
  const currentSlug = pathname.split("/").filter(Boolean).pop() ?? "";
  const current =
    ONBOARDING_STEPS.find((s) => s.slug === currentSlug)?.index ?? 1;

  return (
    <div className="w-full">
      {/* Mobile: compact label + progress bar */}
      <div className="md:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[12px] text-content-secondary">
            Step {current} of {TOTAL_STEPS}
          </span>
          <span className="font-mono text-[12px] text-primary">
            {ONBOARDING_STEPS[current - 1]?.title}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-surface2">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(current / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop: numbered steps with connectors */}
      <ol className="hidden items-center md:flex">
        {ONBOARDING_STEPS.map((step, i) => {
          const done = step.index < current;
          const active = step.index === current;
          return (
            <li
              key={step.slug}
              className={`flex items-center ${i < ONBOARDING_STEPS.length - 1 ? "flex-1" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[13px] font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary text-white"
                      : done
                        ? "border-primary bg-primary-bg text-primary"
                        : "border-neutral-border bg-neutral-surface text-content-muted"
                  }`}
                >
                  {done ? <Check size={15} strokeWidth={2.5} /> : step.index}
                </span>
                <span
                  className={`text-[13px] ${
                    active ? "font-medium text-ink" : "text-content-muted"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {i < ONBOARDING_STEPS.length - 1 && (
                <span
                  className={`mx-3 h-px flex-1 ${done ? "bg-primary/40" : "bg-neutral-border"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
