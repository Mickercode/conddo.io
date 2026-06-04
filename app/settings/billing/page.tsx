"use client";

import { CreditCard } from "lucide-react";
import { SettingsShell } from "@/components/app/SettingsShell";
import { EmptyState } from "@/components/ui/States";

export default function BillingSettings() {
  return (
    <SettingsShell active="billing" title="Subscription & Billing" description="Manage your plan, payment method, and invoices.">
      <EmptyState
        icon={CreditCard}
        title="Billing coming soon"
        description="During early access, all features are free. Plans, payment method, and invoice history will appear here once billing is rolled out."
      />
    </SettingsShell>
  );
}
