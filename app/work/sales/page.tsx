"use client";

import Link from "next/link";
import {
  ScanLine, Users, ShoppingCart, ArrowRight, Phone, Plus,
} from "lucide-react";
import { WorkShell, type WorkNavItem } from "@/components/app/WorkShell";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { posApi } from "@/lib/api/pos";
import { naira } from "@/lib/format";

const NAV: WorkNavItem[] = [
  { label: "Sell", href: "/pos",        icon: ScanLine },
  { label: "Customers", href: "/customers", icon: Users },
];

const fmtTime = (s?: string | null) => {
  if (!s) return "—";
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
};

/** Cashier landing — focused on "what's next" today. The whole job lives
 *  on /pos; this page is the homepage they see between shifts. */
export default function CashierLanding() {
  const { data: me } = useApiQuery(meQuery);
  const sessionQ = useApiQuery(posApi.currentSession);
  const session = sessionQ.data;

  const firstName = me?.user.fullName?.trim().split(/\s+/)[0] ?? "";
  const greet = firstName ? `Hi, ${firstName}.` : "Hi there.";

  return (
    <WorkShell title={greet} subtitle="Cashier dashboard" nav={NAV}>
      <div className="space-y-6">
        {/* Open-shift / continue-shift card */}
        {session ? (
          <div className="rounded-2xl border border-success/30 bg-emerald-500/15 p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-emerald-300">Shift open</p>
                <p className="mt-1 text-[16px] font-medium text-white">
                  Opened {fmtTime(session.openedAt)} · {session.summary?.salesCount ?? 0} sale{session.summary?.salesCount === 1 ? "" : "s"} so far
                </p>
              </div>
              <Link href="/pos">
                <Button variant="primary" size="md">
                  <Plus size={14} /> Ring up sale
                </Button>
              </Link>
            </div>
            {session.summary && (
              <div className="grid grid-cols-3 gap-3 border-t border-success/20 pt-4">
                <Stat label="Total sales" value={naira(session.summary.totalSales)} />
                <Stat label="Cash" value={naira(session.summary.totalCash)} />
                <Stat label="Transfers" value={naira(session.summary.totalTransfer)} />
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[16px] font-medium text-white">Ready to start your shift?</p>
                <p className="mt-1 text-[13px] text-white/65">
                  Count the cash in the till, then open your shift to start ringing up sales.
                </p>
              </div>
              <Link href="/pos">
                <Button variant="primary" size="md">
                  Open shift <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickLink
            href="/pos"
            icon={ScanLine}
            title="POS terminal"
            description="Search products, scan barcodes, take payments, print receipts."
          />
          <QuickLink
            href="/customers"
            icon={Users}
            title="Customers"
            description="Look up a phone number, see who's a returning customer."
          />
        </div>

        <p className="rounded-md bg-white/[0.02] px-4 py-3 text-[12px] text-white/45">
          <Chip tone="neutral">Tip</Chip>{" "}
          Plug in a barcode scanner and the picker accepts scanned codes — straight from your scanner to the cart.
        </p>
      </div>
    </WorkShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.05em] text-white/45">{label}</p>
      <p className="mt-1 font-mono text-[16px] font-medium text-white">{value}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-cinema-elev p-5 transition-colors hover:border-primary hover:bg-primary/[0.08]"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-white">{title}</p>
        <p className="mt-0.5 text-[13px] text-white/65">{description}</p>
      </div>
      <ArrowRight size={16} className="mt-1 shrink-0 text-white/45 transition-colors group-hover:text-primary" />
    </Link>
  );
}
