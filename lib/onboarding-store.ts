import { create } from "zustand";

// Onboarding wizard state, shared across the step pages. Stubbed for now —
// fields mirror the PRD §15 signup flow; wiring to the backend signup API
// (POST /api/v1/tenants) comes once the screens are built from the design.

export type OnboardingData = {
  // Step 1 — business details
  businessName: string;
  phone: string;
  email: string;
  password: string;
  // Step 2 — type
  verticalId: string | null;
  // Step 3 — profile
  description: string;
  address: string;
  // Step 4 — plan
  planId: string | null;
};

type OnboardingStore = OnboardingData & {
  /** Highest step index the user has reached (for the stepper). */
  furthestStep: number;
  update: (patch: Partial<OnboardingData>) => void;
  reachStep: (index: number) => void;
};

export const useOnboarding = create<OnboardingStore>((set) => ({
  businessName: "",
  phone: "",
  email: "",
  password: "",
  verticalId: null,
  description: "",
  address: "",
  planId: null,
  furthestStep: 1,
  update: (patch) => set(patch),
  reachStep: (index) =>
    set((s) => ({ furthestStep: Math.max(s.furthestStep, index) })),
}));
