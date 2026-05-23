import { redirect } from "next/navigation";

// The product app entry. For now it routes straight into onboarding;
// once auth + dashboard exist this becomes an auth-gated redirect.
export default function Home() {
  redirect("/onboarding");
}
