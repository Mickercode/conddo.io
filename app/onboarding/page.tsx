import { redirect } from "next/navigation";
import { hrefFor, ONBOARDING_STEPS } from "@/lib/onboarding-steps";

export default function OnboardingIndex() {
  redirect(hrefFor(ONBOARDING_STEPS[0].slug));
}
