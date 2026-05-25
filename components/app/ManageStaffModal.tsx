"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { staffApi, type StaffMember, type StaffRole } from "@/lib/api/staff";
import { ApiError } from "@/lib/api/client";

/** Manage a teammate (PATCH /staff/{id}): change role, activate/deactivate, resend invite. */
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
  const [role, setRole] = useState<StaffRole>("STAFF");
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (member) {
      setRole(member.role);
      setActive(member.status !== "inactive");
    }
  }, [member]);

  if (!member) return null;

  const dirty = role !== member.role || active !== (member.status !== "inactive");

  async function save() {
    if (!member) return;
    setSaving(true);
    try {
      await staffApi.update(member.id, { role, active });
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
          <Button variant="primary" size="md" onClick={save} disabled={saving || !dirty}>
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Role" htmlFor="ms-role">
          <Select id="ms-role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
            <option value="STAFF">Staff</option>
            <option value="TENANT_ADMIN">Admin</option>
          </Select>
        </Field>

        <label className="flex items-center justify-between rounded-lg border border-neutral-border px-3 py-2.5">
          <span className="text-[14px] text-ink">Account active</span>
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-border text-primary focus:ring-primary"
          />
        </label>

        {member.status === "invited" && (
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-neutral-border py-2.5 text-[14px] font-medium text-content-secondary hover:bg-neutral-surface2 hover:text-ink disabled:opacity-50"
          >
            <Mail size={16} /> {resending ? "Resending…" : "Resend invite"}
          </button>
        )}
      </div>
    </Modal>
  );
}
