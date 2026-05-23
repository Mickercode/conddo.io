import { Upload } from "lucide-react";
import { Field } from "@/components/onboarding/Field";
import { StepShell } from "@/components/onboarding/StepShell";

// Step 3 — Business Profile (PRD §15.1).
// Placeholder — logo upload + fields refine from the Stitch design.
export default function BusinessProfileStep() {
  return (
    <StepShell slug="business-profile">
      <div className="space-y-5">
        {/* Logo dropzone */}
        <div>
          <span className="mb-1.5 flex items-center gap-2 text-[14px] font-medium text-ink">
            Logo
            <span className="font-mono text-[11px] font-normal text-content-muted">optional</span>
          </span>
          <div className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-strong bg-neutral-bg px-6 py-8 text-center transition-colors hover:border-primary hover:bg-primary-bg/30">
            <Upload size={20} className="text-content-muted" />
            <p className="text-[14px] text-content-secondary">
              Drag &amp; drop, or <span className="text-primary">browse</span>
            </p>
            <p className="font-mono text-[11px] text-content-muted">PNG or SVG, up to 2&nbsp;MB</p>
          </div>
        </div>

        <Field
          label="Business address"
          name="address"
          placeholder="123 Adeola Odeku St, Victoria Island, Lagos"
        />

        <label className="block">
          <span className="mb-1.5 block text-[14px] font-medium text-ink">
            Short description
          </span>
          <textarea
            name="description"
            rows={3}
            placeholder="What does your business do? One or two sentences."
            className="w-full rounded-md border border-neutral-strong bg-neutral-surface px-3.5 py-2.5 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
          />
        </label>

        <Field
          label="Instagram handle"
          name="instagram"
          placeholder="@yourbusiness"
          optional
        />
      </div>
    </StepShell>
  );
}
