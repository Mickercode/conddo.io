import {
  LayoutGrid,
  ShoppingBag,
  Users,
  Megaphone,
  Wallet,
} from "lucide-react";
import { Frame } from "./Frame";
import { Chip } from "../ui/Chip";
import { APP_DOMAIN } from "@/lib/brand";

const navItems = [
  { icon: LayoutGrid, label: "Dashboard", active: true },
  { icon: ShoppingBag, label: "Orders", active: false },
  { icon: Users, label: "Customers", active: false },
  { icon: Wallet, label: "Payments", active: false },
  { icon: Megaphone, label: "Marketing", active: false },
];

const stats = [
  { label: "Revenue", value: "₦1.84M", delta: "+12%", tone: "success" as const },
  { label: "Orders", value: "146", delta: "+8", tone: "success" as const },
  { label: "New customers", value: "32", delta: "this week", tone: "neutral" as const },
];

// Relative heights for the faux weekly revenue bars.
const bars = [38, 52, 44, 70, 60, 88, 64];

const orders = [
  { id: "#1042", name: "Adaeze O.", tone: "success" as const, status: "Paid" },
  { id: "#1041", name: "Tunde B.", tone: "warning" as const, status: "Due soon" },
  { id: "#1040", name: "Chioma N.", tone: "danger" as const, status: "Overdue" },
];

export function DashboardPreview() {
  return (
    <Frame url={`amaka-styles.${APP_DOMAIN}`}>
      <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr]">
        {/* Sidebar */}
        <aside className="hidden border-r border-neutral-border bg-neutral-surface2/60 p-4 sm:block">
          <div className="mb-5 px-2 font-sans text-sm font-medium tracking-[0.02em]">
            <span className="text-ink">conddo</span>
            <span className="text-primary">.io</span>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ icon: Icon, label, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] ${
                  active
                    ? "bg-primary-bg font-medium text-primary"
                    : "text-content-secondary"
                }`}
              >
                <Icon size={15} strokeWidth={2} />
                {label}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[13px] text-content-muted">Good morning,</p>
              <p className="text-base font-medium text-ink">Amaka 👋</p>
            </div>
            <Chip tone="primary">Today</Chip>
          </div>

          {/* Stat tiles */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-neutral-border bg-neutral-surface p-3"
              >
                <p className="mb-1 text-[11px] text-content-muted">{s.label}</p>
                <p className="font-mono text-lg font-medium leading-none text-ink">
                  {s.value}
                </p>
                <p
                  className={`mt-1.5 font-mono text-[10px] ${
                    s.tone === "success" ? "text-success" : "text-content-muted"
                  }`}
                >
                  {s.delta}
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="mb-5 rounded-lg border border-neutral-border bg-neutral-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[12px] font-medium text-ink">Revenue this week</p>
              <span className="font-mono text-[11px] text-content-muted">Mon–Sun</span>
            </div>
            <div className="flex h-24 items-end gap-2">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${
                    i === bars.length - 2 ? "bg-primary" : "bg-primary/25"
                  }`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="rounded-lg border border-neutral-border bg-neutral-surface">
            <div className="flex items-center justify-between border-b border-neutral-border px-4 py-2.5">
              <p className="text-[12px] font-medium text-ink">Recent orders</p>
              <span className="text-[11px] text-primary">View all</span>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {orders.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[12px] text-content-muted">
                      {o.id}
                    </span>
                    <span className="text-[13px] text-ink">{o.name}</span>
                  </div>
                  <Chip tone={o.tone}>{o.status}</Chip>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Frame>
  );
}
