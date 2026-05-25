import { Pill } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/ui/States";

// Vertical tool (pharmacy): prescriptions — dispensing log, refill reminders,
// interaction checks. Surfaces when the tenant activates `prescriptions`.
export default function PrescriptionsPage() {
  return (
    <AppShell title="Prescriptions" subtitle="Dispensing & refills">
      <EmptyState
        icon={Pill}
        title="Prescriptions is being set up"
        description="Record dispensing, schedule refill reminders, and run interaction checks. This pharmacy tool activates with your plan once its backend module is live."
      />
    </AppShell>
  );
}
