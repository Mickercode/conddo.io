"use client";

import { useState } from "react";
import { CheckCircle2, Crown } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import {
  staffApi,
  STAFF_ROLE_CATALOGUE,
  roleDefFor,
  type StaffSubRole,
} from "@/lib/api/staff";
import { ApiError } from "@/lib/api/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Send an invite by email + role. The staffer receives an email with a
 *  one-time `acceptInviteToken`; they land on /accept-invite, set their
 *  password, and route to their role landing. */
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
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<StaffSubRole>("CASHIER");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const roleDef = roleDefFor(selectedRole);

  function close() {
    if (saving) return;
    setEmail("");
    setFullName("");
    setSelectedRole("CASHIER");
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
      await staffApi.invite({
        email: email.trim(),
        staffRole: selectedRole,
        fullName: fullName.trim() || undefined,
      });
      toast.success("Invite sent", `${email.trim()} → ${roleDef.label}`);
      close();
      onInvited?.();
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.code === "PLAN_LIMIT_REACHED") {
        toast.error(
          "Staff limit reached",
          "Upgrade your plan to invite more teammates.",
        );
        return;
      }
      // BE V50 — one email = one Conddo account, globally. An owner trying
      // to invite a colleague who already has an account on a different
      // workspace gets EMAIL_ALREADY_REGISTERED here. The colleague needs
      // to either use a different email for this workspace or have their
      // existing account moved (not yet supported in the FE — log a hint).
      if (apiErr?.code === "EMAIL_ALREADY_REGISTERED" || apiErr?.code === "USER_ALREADY_EXISTS") {
        toast.error(
          "Email already in use",
          "That email already has a Conddo account. Ask them to use a different email for this workspace.",
        );
        return;
      }
      toast.error(
        "Couldn't send invite",
        apiErr?.message ?? "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Invite a teammate"
      description="They'll receive an email with a link to set up their account."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="invite-staff-form" disabled={saving}>
            {saving ? "Sending…" : "Send invite"}
          </Button>
        </>
      }
    >
      <form id="invite-staff-form" onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" htmlFor="is-email" required error={error}>
            <TextInput
              id="is-email"
              type="email"
              value={email}
              error={error}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@example.com"
              autoFocus
            />
          </Field>
          <Field label="Name (optional)" htmlFor="is-name" hint="So their welcome email is personal.">
            <TextInput
              id="is-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Tunde Bello"
            />
          </Field>
        </div>

        {/* Role picker — cards instead of <Select> so the description is
            visible inline rather than tucked into a hint */}
        <div>
          <label className="mb-2 block text-[12px] font-medium uppercase tracking-[0.06em] text-white/65">
            Role
          </label>
          <div className="space-y-2">
            {STAFF_ROLE_CATALOGUE.map((r) => {
              const active = r.key === selectedRole;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setSelectedRole(r.key)}
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                    active
                      ? "border-primary bg-primary/[0.08]/30"
                      : "border-white/[0.06] bg-cinema-elev hover:border-primary-light"
                  }`}
                >
                  <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    active ? "bg-primary text-white" : "border border-white/[0.06]"
                  }`}>
                    {active && <CheckCircle2 size={11} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-white">{r.label}</p>
                    <p className="mt-0.5 text-[12px] text-white/65">{r.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected role's permission preview */}
        <div className="rounded-xl border border-primary/20 bg-primary/[0.08]/30 p-3">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.05em] text-primary">
            What {roleDef.label}s can do
          </p>
          <ul className="space-y-1">
            {roleDef.access.map((line, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-white/65">
                <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-300" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="flex items-start gap-1.5 text-[11px] text-white/45">
          <Crown size={11} className="mt-0.5 shrink-0 text-amber-300" />
          You can change someone's role anytime from this page. To make
          someone a second owner, change their role to Manager and contact
          support.
        </p>
      </form>
    </Modal>
  );
}
