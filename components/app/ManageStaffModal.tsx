"use client";

import { useEffect, useState } from "react";
import { Mail, Crown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  staffApi,
  STAFF_ROLE_CATALOGUE,
  roleDefFor,
  type StaffMember,
  type StaffSubRole,
} from "@/lib/api/staff";
import { ApiError } from "@/lib/api/client";

/** Manage a teammate (PATCH /staff/{id}): change sub-role, activate /
 *  deactivate, resend invite. The owner can't be edited from here (their
 *  row doesn't expose the action) — promoting another member to a second
 *  owner is a support-side operation. */
export function ManageStaffModal({
  open,
  onClose,
  member,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  member: StaffMember | null;
  onChanged?: () => void;
}) {
  const toast = useToast();
  const [staffRole, setStaffRole] = useState<StaffSubRole>("CASHIER");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (member) {
      setStaffRole(member.staffRole ?? "CASHIER");
      setActive(member.status !== "inactive");
    }
  }, [member]);

  if (!member) return null;

  const isOwner = member.role === "TENANT_ADMIN";
  const dirty = !isOwner && (
    staffRole !== (member.staffRole ?? "CASHIER") ||
    active !== (member.status !== "inactive")
  );

  const roleDef = roleDefFor(staffRole);

  async function save() {
    if (!member || isOwner) return;
    setSaving(true);
    try {
      await staffApi.update(member.id, { staffRole, active });
      toast.success("Teammate updated", member.name || member.email);
      onClose();
      onChanged?.();
    } catch (err) {
      toast.error("Couldn't update", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function resend() {
    if (!member) return;
    setResending(true);
    try {
      await staffApi.resendInvite(member.id);
      toast.success("Invite resent", member.email);
    } catch (err) {
      toast.error("Couldn't resend invite", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title={member.name || member.email}
      description={member.email}
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={() => !saving && onClose()} disabled={saving}>Close</Button>
          {!isOwner && (
            <Button variant="primary" size="md" onClick={save} disabled={saving || !dirty}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          )}
        </>
      }
    >
      {isOwner ? (
        <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-amber-500/15 px-4 py-3">
          <Crown size={16} className="mt-0.5 shrink-0 text-amber-300" />
          <div>
            <p className="text-[14px] font-medium text-white">This is the workspace owner</p>
            <p className="mt-0.5 text-[12px] text-white/65">
              The owner's role can't be changed from the dashboard. Contact support to transfer ownership.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Role" htmlFor="ms-role" hint={roleDef.description}>
            <Select
              id="ms-role"
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as StaffSubRole)}
            >
              {STAFF_ROLE_CATALOGUE.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>

          {/* Compact preview of the selected role's access */}
          <div className="rounded-lg bg-white/[0.02] px-3 py-2">
            <p className="mb-1.5 text-[10px] uppercase tracking-[0.05em] text-white/45">
              {roleDef.label} can
            </p>
            <ul className="space-y-0.5 text-[12px] text-white/65">
              {roleDef.access.slice(0, 3).map((line, i) => (
                <li key={i} className="line-clamp-1">· {line}</li>
              ))}
              {roleDef.access.length > 3 && (
                <li className="text-[11px] text-white/45">…and {roleDef.access.length - 3} more.</li>
              )}
            </ul>
          </div>

          <label className="flex items-center justify-between rounded-lg border border-white/[0.06] px-3 py-2.5">
            <span className="text-[14px] text-white">Account active</span>
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="h-4 w-4 rounded border-white/[0.06] text-primary focus:ring-primary"
            />
          </label>

          {member.status === "invited" && (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-white/[0.06] py-2.5 text-[14px] font-medium text-white/65 hover:bg-white/[0.02] hover:text-white disabled:opacity-50"
            >
              <Mail size={16} /> {resending ? "Resending…" : "Resend invite"}
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
