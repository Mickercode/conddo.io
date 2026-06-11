"use client";

import Link from "next/link";
import {
  FileText, MessageCircle, ListChecks, Activity, ArrowRight, AlertCircle,
  Users,
} from "lucide-react";
import { WorkShell, type WorkNavItem } from "@/components/app/WorkShell";
import { Chip } from "@/components/ui/Chip";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { featuresApi } from "@/lib/api/features";
import { followupsApi, type Followup } from "@/lib/api/followups";

const NAV: WorkNavItem[] = [
  { label: "Prescriptions", href: "/prescriptions",        icon: FileText },
  { label: "Consultations", href: "/consultations",        icon: MessageCircle },
  { label: "Follow-ups",    href: "/pharmacy/followups",   icon: ListChecks },
  { label: "Customers",     href: "/customers",            icon: Users },
];

const fmtTimeShort = (s: string): string => {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

/** Pharmacist landing — patient-centric. Surfaces follow-ups due today
 *  (when the feature flag is granted) so the pharmacist sees clinical
 *  duties before they have to click anywhere. */
export default function ClinicalLanding() {
  const { data: me } = useApiQuery(meQuery);
  const flagsQ = useApiQuery(featuresApi.flags);
  const followupsEnabled = flagsQ.data?.some((f) => f.featureKey === "followup_workflow" && f.enabled);

  const dueQ = useApiQuery(
    () => followupsEnabled ? followupsApi.dueToday() : Promise.resolve({ data: [] as Followup[] }),
    [followupsEnabled],
  );
  const due = dueQ.data ?? [];
  const overdue = due.filter((f) => new Date(f.dueDate).getTime() < Date.now()).length;

  const firstName = me?.user.fullName?.trim().split(/\s+/)[0] ?? "";
  const greet = firstName ? `Good day, Pharm. ${firstName}.` : "Good day.";

  return (
    <WorkShell title={greet} subtitle="Pharmacist dashboard" nav={NAV}>
      <div className="space-y-6">
        {followupsEnabled && due.length > 0 && (
          <div className="rounded-2xl border border-primary/30 bg-primary-bg/40 p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.05em] text-primary">Follow-ups due today</p>
                <p className="mt-1 text-[16px] font-medium text-ink">
                  {due.length} patient{due.length === 1 ? "" : "s"} to check in with
                  {overdue > 0 && <span className="ml-2 text-danger">· {overdue} overdue</span>}
                </p>
              </div>
              <Link
                href="/pharmacy/followups"
                className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-neutral-surface px-3 py-1.5 text-[12px] font-medium text-primary hover:bg-primary hover:text-white"
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <ul className="mt-3 space-y-1.5">
              {due.slice(0, 5).map((f) => {
                const isOverdue = new Date(f.dueDate).getTime() < Date.now();
                return (
                  <li key={f.id} className="flex items-start justify-between gap-3 rounded-md bg-neutral-surface px-3 py-2">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink">{f.customer.name ?? "Patient"}</p>
                      <p className="line-clamp-1 text-[11px] text-content-secondary">{f.checkNote}</p>
                    </div>
                    <Chip tone={isOverdue ? "danger" : "warning"}>{fmtTimeShort(f.dueDate)}</Chip>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <QuickLink
            href="/prescriptions/review"
            icon={FileText}
            title="Review prescriptions"
            description="Verify, dispense, log notes."
          />
          <QuickLink
            href="/consultations"
            icon={MessageCircle}
            title="Consultations"
            description="Telepharmacy and walk-in clinical conversations."
          />
          <QuickLink
            href="/pharmacy/followups"
            icon={ListChecks}
            title="Follow-ups"
            description="Schedule clinical check-ins after dispense."
          />
          <QuickLink
            href="/customers"
            icon={Activity}
            title="Patient records"
            description="Open a patient profile to see their EMR."
          />
        </div>

        <p className="flex items-center gap-2 rounded-md bg-neutral-surface2 px-4 py-3 text-[12px] text-content-muted">
          <AlertCircle size={11} />
          Patient EMR entries are immutable — every note you save becomes part of the permanent medical record.
        </p>
      </div>
    </WorkShell>
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
      className="group flex items-start gap-3 rounded-xl border border-neutral-border bg-neutral-surface p-5 transition-colors hover:border-primary hover:bg-primary-bg/30"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-bg text-primary">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-ink">{title}</p>
        <p className="mt-0.5 text-[13px] text-content-secondary">{description}</p>
      </div>
      <ArrowRight size={16} className="mt-1 shrink-0 text-content-muted transition-colors group-hover:text-primary" />
    </Link>
  );
}
