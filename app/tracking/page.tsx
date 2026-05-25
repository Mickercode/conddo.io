import { Truck } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/ui/States";

// Vertical tool (logistics): shipment tracking. Surfaces when the tenant
// activates `tracking.advanced`.
export default function TrackingPage() {
  return (
    <AppShell title="Tracking" subtitle="Deliveries & shipments">
      <EmptyState
        icon={Truck}
        title="Tracking is being set up"
        description="Track deliveries end to end, share live status with customers, and manage your dispatch queue. This logistics tool activates with your plan."
      />
    </AppShell>
  );
}
