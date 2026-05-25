import { ScanLine } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/ui/States";

// Vertical tool: point-of-sale. Surfaces in the sidebar when the tenant's plan
// activates `pos` / `pos.pharmacy`. The terminal UI lands here once the backend
// POS module (sales, offline mode, quick-picks) ships.
export default function PosPage() {
  return (
    <AppShell title="POS" subtitle="Point of sale">
      <EmptyState
        icon={ScanLine}
        title="POS is being set up"
        description="Ring up in-person sales, take payments, and decrement stock automatically. This terminal activates with your plan — we're finishing the backend for it."
      />
    </AppShell>
  );
}
