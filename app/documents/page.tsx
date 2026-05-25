import { Folder } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/ui/States";

// Vertical tool (professional services): document vault. Surfaces when the
// tenant activates `document-vault`.
export default function DocumentsPage() {
  return (
    <AppShell title="Documents" subtitle="Secure client files">
      <EmptyState
        icon={Folder}
        title="Document vault is being set up"
        description="Store contracts, proposals, and client files securely, and share them with the right people. This tool activates with your plan once its backend is live."
      />
    </AppShell>
  );
}
