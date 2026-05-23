import { CircleCheck, Sparkles } from "lucide-react";
import { StepShell } from "@/components/onboarding/StepShell";

// Step 5 — Your Business is Ready (PRD §15.1 + §19.9 website-prep message).
// Placeholder — final layout + checklist refine from the Stitch design.
const checklist = [
  "Add your first portfolio photo",
  "Set up your services and pricing",
  "Connect your Paystack account",
  "Add your first customer",
];

export default function ReadyStep() {
  return (
    <StepShell slug="ready" hideBack continueLabel="Go to dashboard" continueHref="/">
      <div className="rounded-lg bg-primary-bg p-5">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <p className="text-[15px] font-medium text-ink">
            Your website is being personalised for your business.
          </p>
        </div>
        <p className="text-[14px] leading-relaxed text-content-secondary">
          This typically takes 24–48 hours. We&apos;ll notify you the moment it&apos;s
          ready to preview at <span className="font-mono text-primary">businessname.conddo.io</span>.
        </p>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-[14px] font-medium text-ink">
          While you wait — first things to set up:
        </p>
        <ul className="space-y-2.5">
          {checklist.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <CircleCheck size={18} className="shrink-0 text-content-muted" />
              <span className="text-[14px] text-content-secondary">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </StepShell>
  );
}
