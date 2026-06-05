import Link from "next/link";
import type { ReactNode } from "react";
import {
  Building2,
  Bell,
  CreditCard,
  IdCard,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";

type SettingsKey = "profile" | "billing" | "notifications" | "connections" | "staff" | "api-keys" | "danger";

// Settings entries are only listed once the backend endpoints behind them
// exist. Connected Accounts / API Keys stay hidden until those modules ship
// (page files still exist for direct-link access but show empty/disabled
// states). Billing now ships with the pricing-tiers work so it's back in
// the nav; the page degrades to "Billing is being set up" via QueryBoundary
// when the BE hasn't deployed.
const NAV: { key: SettingsKey; label: string; icon: LucideIcon; href: string }[] = [
  { key: "profile", label: "Business Profile", icon: Building2, href: "/settings" },
  { key: "billing", label: "Subscription and Billing", icon: CreditCard, href: "/settings/billing" },
  { key: "notifications", label: "Notifications", icon: Bell, href: "/settings/notifications" },
  { key: "staff", label: "Staff and Permissions", icon: IdCard, href: "/staff" },
];

/** Settings layout: the standard app shell + the settings sub-navigation, shared by
 *  every settings sub-section so they stay consistent and deep-linkable. */
export function SettingsShell({
  active,
  title,
  description,
  children,
}: {
  active: SettingsKey;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <AppShell title="Settings">
      <div className="flex flex-col gap-8 md:flex-row">
        <nav className="shrink-0 md:w-56">
          <p className="mb-2 px-3 text-[11px] uppercase tracking-[0.05em] text-content-muted">Management</p>
          <div className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                  item.key === active
                    ? "bg-primary-bg font-medium text-primary"
                    : "text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <div className="my-1 h-px bg-neutral-border" />
            <Link
              href="/settings/danger"
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                active === "danger" ? "bg-danger-bg font-medium text-danger" : "text-danger hover:bg-danger-bg"
              }`}
            >
              <TriangleAlert size={18} />
              Danger Zone
            </Link>
          </div>
        </nav>

        <div className="min-w-0 max-w-3xl flex-1">
          <div className="mb-6">
            <h2 className="text-[22px] font-medium tracking-[-0.01em] text-ink">{title}</h2>
            <p className="mt-1 text-[15px] text-content-secondary">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </AppShell>
  );
}
