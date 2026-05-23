import { Field } from "@/components/onboarding/Field";
import { StepShell } from "@/components/onboarding/StepShell";

// Step 1 — Business Details (PRD §15.1).
// Placeholder layout — refine fields/validation from the Stitch onboarding design.
export default function BusinessDetailsStep() {
  return (
    <StepShell slug="business-details">
      <div className="space-y-5">
        <Field
          label="Business name"
          name="businessName"
          placeholder="e.g. Amaka Styles"
        />
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          placeholder="+234 801 234 5678"
          hint="We'll send a one-time code to verify it."
        />
        <Field
          label="Email address"
          name="email"
          type="email"
          placeholder="you@business.com"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
        />
      </div>
    </StepShell>
  );
}
