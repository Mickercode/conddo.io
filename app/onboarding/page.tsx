import { redirect } from "next/navigation";
import { FLOW, hrefFor } from "@/lib/onboarding-steps";

export default function OnboardingIndex() {
  redirect(hrefFor(FLOW[0].slug));
}
