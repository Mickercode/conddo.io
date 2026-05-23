import type { ReactNode } from "react";
import { OnboardingChrome } from "@/components/onboarding/OnboardingChrome";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <OnboardingChrome>{children}</OnboardingChrome>;
}
