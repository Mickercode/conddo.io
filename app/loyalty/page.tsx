import { Gift } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/ui/States";

// Vertical tool (beauty & wellness, retail): loyalty / rewards. Surfaces when
// the tenant activates `loyalty`.
export default function LoyaltyPage() {
  return (
    <AppShell title="Loyalty" subtitle="Rewards & repeat customers">
      <EmptyState
        icon={Gift}
        title="Loyalty is being set up"
        description="Reward repeat customers with points and perks, and bring them back more often. This tool activates with your plan once its backend is live."
      />
    </AppShell>
  );
}
