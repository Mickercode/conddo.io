import { ShoppingBag } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/ui/States";

// Vertical tool (retail): online store / ecommerce. Surfaces when the tenant
// activates `ecommerce`.
export default function StorePage() {
  return (
    <AppShell title="Store" subtitle="Online storefront">
      <EmptyState
        icon={ShoppingBag}
        title="Your online store is being set up"
        description="Publish products to a storefront, take orders online, and sync stock with your inventory. This tool activates with your plan once its backend is live."
      />
    </AppShell>
  );
}
