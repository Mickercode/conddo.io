import { Utensils } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/ui/States";

// Vertical tool (food & beverage): table management. Surfaces when the tenant
// activates `table-mgmt`.
export default function TablesPage() {
  return (
    <AppShell title="Tables" subtitle="Floor & reservations">
      <EmptyState
        icon={Utensils}
        title="Table management is being set up"
        description="Lay out your floor, take reservations, and turn tables faster. This food & beverage tool activates with your plan once its backend is live."
      />
    </AppShell>
  );
}
