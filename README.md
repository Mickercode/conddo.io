# Conddo.io — Product App (`conddo-app`)

The authenticated **product application** for Conddo.io (tenant dashboard,
onboarding, operations & marketing modules). Separate from the marketing site
(`landing/`) and the backend (`backend/`). Built with **Next.js 14 (App Router)
+ Tailwind**, sharing the exact brand system from the landing page.

> First slice shipped: the **guided onboarding flow** (PRD §15). Screens are
> on-brand **placeholders** structured to be filled in from the Google Stitch
> designs.

## Run

```bash
cd conddo-app
npm install      # first time
npm run dev      # http://localhost:3000  (→ redirects to /onboarding)
```

`npm run build` for a production build.

## Structure

```
app/
  layout.tsx              fonts (Inter + Geist Mono), metadata
  page.tsx                → redirects to /onboarding
  globals.css             brand tokens (shared with landing)
  onboarding/
    layout.tsx            logo + Stepper + centered card shell
    page.tsx              → redirects to step 1
    business-details/     Step 1 (PRD §15.1)
    business-type/        Step 2 — vertical grid
    business-profile/     Step 3 — brand + details
    choose-plan/          Step 4 — plan cards
    ready/                Step 5 — "website being prepared"
components/
  ui/                     Button, Chip (ported from landing)
  onboarding/             Stepper, StepShell, Field
lib/
  onboarding-steps.ts     step order / nav (single source of truth)
  onboarding-store.ts     Zustand wizard state (stubbed)
tailwind.config.ts        brand tokens
```

## Brand

Same system as the landing page: Inter + Geist Mono, violet `#7C5CBF` for
actions/active states, off-white surfaces, **no gradients or drop shadows**
(depth via hairline borders + tonal layering).

## Status & next steps

- Onboarding is **scaffolded, not wired**. Step pages are placeholders; the
  Stitch designs define the final UI per step.
- **To do:** build each step from the Stitch design; wire React Hook Form + Zod
  validation against the Zustand store; connect signup to the backend
  (`POST /api/v1/tenants`); add OTP (Termii) on the phone step; then the
  dashboard.
- **Pricing note:** plan cards use PRD §14 (₦15k/35k/65k); the landing site
  shows ₦25k/45k/80k — reconcile which is canonical.
