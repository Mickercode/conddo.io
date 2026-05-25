"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { staffApi, type StaffRole } from "@/lib/api/staff";
import { ApiError } from "@/lib/api/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ROLES: { value: StaffRole; label: string; hint: string }[] = [
  { value: "STAFF", label: "Staff", hint: "Day-to-day access: orders, customers, bookings, inventory." },
  { value: "TENANT_ADMIN", label: "Admin", hint: "Full access including settings, billing, and staff." },
];

/** Invite a teammate by email (POST /staff/invite). They receive an invite to set a password. */
export function InviteStaffModal({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited?: () => void;
}) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("STAFF");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function close() {
    if (saving) return;
    setEmail("");
    setRole("STAFF");
    setError(undefined);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setSaving(true);
    try {
      await staffApi.invite(email.trim(), role);
      toast.success("Invite sent", email.trim());
      close();
      onInvited?.();
    } catch (err) {
      toast.error("Couldn't send invite", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Invite staff"
      description="Send an email invite. They'll set their own password to join your workspace."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="invite-staff-form" disabled={saving}>
            {saving ? "Sending…" : "Send invite"}
          </Button>
        </>
      }
    >
      <form id="invite-staff-form" onSubmit={submit} className="space-y-4">
        <Field label="Email" htmlFor="is-email" required error={error}>
          <TextInput id="is-email" type="email" value={email} error={error} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@example.com" autoFocus />
        </Field>
        <Field label="Role" htmlFor="is-role" hint={ROLES.find((r) => r.value === role)?.hint}>
          <Select id="is-role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
