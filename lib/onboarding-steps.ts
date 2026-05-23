// The guided signup flow (PRD §15). Single source of truth for step order,
// labels, and navigation. The Stitch design fills in each step's UI; this
// defines the skeleton they slot into.

export type OnboardingStep = {
  slug: string;
  index: number; // 1-based
  title: string;
  subtitle: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    slug: "business-details",
    index: 1,
    title: "Let's set up your business",
    subtitle: "Start with the basics. This takes about a minute.",
  },
  {
    slug: "business-type",
    index: 2,
    title: "What kind of business is it?",
    subtitle: "We pre-configure the platform for your industry.",
  },
  {
    slug: "business-profile",
    index: 3,
    title: "Add your brand",
    subtitle: "Your logo and details — used across your website and tools.",
  },
  {
    slug: "choose-plan",
    index: 4,
    title: "Choose your plan",
    subtitle: "14 days free on every plan. No card charged today.",
  },
  {
    slug: "ready",
    index: 5,
    title: "Your business is ready",
    subtitle: "Your site is being prepared. Here's what to do next.",
  },
];

export const TOTAL_STEPS = ONBOARDING_STEPS.length;

export const hrefFor = (slug: string) => `/onboarding/${slug}`;

export const stepBySlug = (slug: string) =>
  ONBOARDING_STEPS.find((s) => s.slug === slug);

export const nextStep = (slug: string) => {
  const i = ONBOARDING_STEPS.findIndex((s) => s.slug === slug);
  return i >= 0 && i < ONBOARDING_STEPS.length - 1 ? ONBOARDING_STEPS[i + 1] : undefined;
};

export const prevStep = (slug: string) => {
  const i = ONBOARDING_STEPS.findIndex((s) => s.slug === slug);
  return i > 0 ? ONBOARDING_STEPS[i - 1] : undefined;
};
