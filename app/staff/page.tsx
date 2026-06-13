"use client";

import { useState } from "react";
import { UserPlus, IdCard } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { InviteStaffModal } from "@/components/app/InviteStaffModal";
import { ManageStaffModal } from "@/components/app/ManageStaffModal";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { QueryBoundary } from "@/components/ui/QueryBoundary";
import { EmptyState } from "@/components/ui/States";
import { useApiQuery } from "@/hooks/useApiQuery";
import { staffApi, roleDefFor, type StaffMember, type StaffStatus } from "@/lib/api/staff";

const statusChip: Record<StaffStatus, { tone: "success" | "warning" | "neutral"; label: string }> = {
  active: { tone: "success", label: "Active" },
  invited: { tone: "warning", label: "Invited" },
  inactive: { tone: "neutral", label: "Inactive" },
};

function roleLabelFor(m: StaffMember): string {
  if (m.role === "TENANT_ADMIN") return "Owner";
  if (m.staffRole) return roleDefFor(m.staffRole).label;
  return "Staff";
}

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
  const [inviteOpen, setInviteOpen] = useState(false);
  const [managing, setManaging] = useState<StaffMember | null>(null);

  return (
    <AppShell
      title="Staff"
      subtitle="Team members and roles"
      actions={
        <Button variant="primary" size="md" onClick={() => setInviteOpen(true)}>
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
              <Button variant="primary" size="md" onClick={() => setInviteOpen(true)}>
                <UserPlus size={17} /> Invite your first teammate
              </Button>
            }
          />
        }
      >
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-cinema-elev">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] uppercase tracking-[0.05em] text-white/65">
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Last active</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {staff.map((m) => (
                  <tr key={m.id} className="group transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/[0.08] font-mono text-[12px] font-medium text-primary">
                          {initialsOf(m.name || m.email)}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[14px] text-white">{m.name || m.email}</p>
                          <p className="truncate text-[12px] text-white/45">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5">
                      <Chip tone={m.role === "TENANT_ADMIN" ? "primary" : "neutral"}>{roleLabelFor(m)}</Chip>
                    </td>
                    <td className="px-5 py-3.5">
                      <Chip tone={statusChip[m.status].tone}>{statusChip[m.status].label}</Chip>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[14px] text-white/65">{fmtLastActive(m.lastActive)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setManaging(m)}
                        className="text-[13px] font-medium text-primary opacity-0 transition-opacity hover:underline group-hover:opacity-100"
                      >
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

      <InviteStaffModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={refetch} />
      <ManageStaffModal
        open={managing !== null}
        onClose={() => setManaging(null)}
        member={managing}
        onChanged={refetch}
      />
    </AppShell>
  );
}
