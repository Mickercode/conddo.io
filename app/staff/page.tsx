"use client";

import { UserPlus, IdCard } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { staffApi, type StaffRole, type StaffStatus } from "@/lib/api/staff";

const roleLabel: Record<StaffRole, string> = { TENANT_ADMIN: "Admin", STAFF: "Staff" };
const statusChip: Record<StaffStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  active: { tone: "success", label: "Active" },
  invited: { tone: "warning", label: "Invited" },
  inactive: { tone: "neutral", label: "Inactive" },
};

const initialsOf = (s: string) =>
  s.trim().split(/[\s@.]+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";

const fmtLastActive = (t: string | null) => {
  if (!t) return "—";
  const d = new Date(t);
  return isNaN(d.getTime()) ? t : d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
};

export default function StaffPage() {
  const { data, loading, error, refetch } = useApiQuery(staffApi.list);
  const staff = data ?? [];

  return (
    <AppShell
      title="Staff"
      subtitle="Team members and roles"
      actions={
        <Button variant="primary" size="md">
          <UserPlus size={17} />
          <span className="hidden sm:inline">Invite staff</span>
        </Button>
      }
    >
      <QueryBoundary
        loading={loading}
        error={error}
        isEmpty={staff.length === 0}
        onRetry={refetch}
        loadingLabel="Loading your team…"
        empty={
          <EmptyState
            icon={IdCard}
            title="No team members yet"
            description="Invite staff to help run your business. You control what each person can access by their role."
            action={
              <Button variant="primary" size="md">
                <UserPlus size={17} /> Invite your first teammate
              </Button>
            }
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-neutral-border bg-neutral-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-neutral-border bg-neutral-surface2 text-[11px] uppercase tracking-[0.05em] text-content-secondary">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last active</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-border">
                {staff.map((m) => (
                  <tr key={m.id} className="group transition-colors hover:bg-neutral-surface2">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-bg font-mono text-[12px] font-medium text-primary">
                          {initialsOf(m.name || m.email)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[14px] text-ink">{m.name || m.email}</p>
                          <p className="truncate text-[12px] text-content-muted">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <Chip tone={m.role === "TENANT_ADMIN" ? "primary" : "neutral"}>{roleLabel[m.role]}</Chip>
                    </td>
                    <td className="px-5 py-3.5">
                      <Chip tone={statusChip[m.status].tone}>{statusChip[m.status].label}</Chip>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[14px] text-content-secondary">{fmtLastActive(m.lastActive)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="text-[13px] font-medium text-primary opacity-0 transition-opacity hover:underline group-hover:opacity-100">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </QueryBoundary>
    </AppShell>
  );
}
