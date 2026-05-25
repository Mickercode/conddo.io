"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { marketingApi, type Lead } from "@/lib/api/marketing";
import { ApiError } from "@/lib/api/client";

/** Create a marketing lead (POST /marketing/leads). */
export function AddLeadModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (lead: Lead) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  function close() {
    if (saving) return;
    setName(""); setEmail(""); setPhone(""); setSource(""); setError(undefined);
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Lead name is required."); return; }
    setSaving(true);
    try {
      const { data } = await marketingApi.createLead({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        source: source.trim() || undefined,
      });
      toast.success("Lead added", data.name);
      close();
      onCreated?.(data);
    } catch (err) {
      toast.error("Couldn't add lead", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add lead"
      description="Track an enquiry from any channel through your funnel."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="add-lead-form" disabled={saving}>
            {saving ? "Adding…" : "Add lead"}
          </Button>
        </>
      }
    >
      <form id="add-lead-form" onSubmit={submit} className="space-y-4">
        <Field label="Name" htmlFor="al-name" required error={error}>
          <TextInput id="al-name" value={name} error={error} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tunde Bello" autoFocus />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone" htmlFor="al-phone">
            <TextInput id="al-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0801 234 5678" />
          </Field>
          <Field label="Email" htmlFor="al-email">
            <TextInput id="al-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          </Field>
        </div>
        <Field label="Source" htmlFor="al-source" hint="Where did they come from? e.g. Instagram, referral, website.">
          <TextInput id="al-source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Instagram" />
        </Field>
      </form>
    </Modal>
  );
}
