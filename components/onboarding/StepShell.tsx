import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { hrefFor, nextStep, prevStep, stepBySlug } from "@/lib/onboarding-steps";

/**
 * Per-step layout: heading + subtitle (from step metadata), the step's content,
 * and a Back/Continue footer. Continue defaults to the next step; the final
 * step overrides it. Step pages just provide their `slug` and content.
 */
export function StepShell({
  slug,
  children,
  continueLabel = "Continue",
  continueHref,
  hideBack = false,
}: {
  slug: string;
  children: ReactNode;
  continueLabel?: string;
  continueHref?: string;
  hideBack?: boolean;
}) {
  const step = stepBySlug(slug);
  const prev = prevStep(slug);
  const next = nextStep(slug);
  const forwardHref = continueHref ?? (next ? hrefFor(next.slug) : "/");

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[28px] leading-tight tracking-[-0.01em] md:text-[32px]">
          {step?.title}
        </h1>
        {step?.subtitle && (
          <p className="mt-2 text-[16px] leading-relaxed text-content-secondary">
            {step.subtitle}
          </p>
        )}
      </header>

      <div>{children}</div>

      <footer className="mt-10 flex items-center justify-between gap-4 border-t border-neutral-border pt-6">
        {prev && !hideBack ? (
          <Button href={hrefFor(prev.slug)} variant="ghost" size="md">
            <ArrowLeft size={16} />
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button href={forwardHref} variant="primary" size="md">
          {continueLabel}
          <ArrowRight size={16} />
        </Button>
      </footer>
    </div>
  );
}
