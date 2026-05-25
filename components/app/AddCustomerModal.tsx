"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { customersApi, type CustomerDetail } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"fullName" | "email" | "phone", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Create a customer (POST /customers). On success notifies the parent so it can
 * refetch its list (or route to the new profile). Reused by the Customers list
 * and anywhere a customer must be created inline (e.g. New Order).
 */
export function AddCustomerModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: (customer: CustomerDetail) => void;
}) {
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  function reset() {
    setFullName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setErrors({});
  }

  function close() {
    if (saving) return;
    reset();
    onClose();
  }

  function validate(): boolean {
    const next: Errors = {};
    if (!fullName.trim()) next.fullName = "Name is required.";
    if (email.trim() && !EMAIL_RE.test(email.trim())) next.email = "Enter a valid email address.";
    if (!email.trim() && !phone.trim()) next.phone = "Add a phone or email so you can reach them.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { data } = await customersApi.create({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success("Customer added", data.name ?? fullName.trim());
      reset();
      onClose();
      onCreated?.(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not add customer. Please try again.";
      toast.error("Couldn't add customer", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add customer"
      description="Create a customer record to track orders, spend, and contact details."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" form="add-customer-form" disabled={saving}>
            {saving ? "Adding…" : "Add customer"}
          </Button>
        </>
      }
    >
      <form id="add-customer-form" onSubmit={submit} className="space-y-4">
        <Field label="Full name" htmlFor="ac-name" required error={errors.fullName}>
          <TextInput
            id="ac-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Amaka Obi"
            error={errors.fullName}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Phone" htmlFor="ac-phone" error={errors.phone}>
            <TextInput
              id="ac-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0801 234 5678"
              error={errors.phone}
            />
          </Field>
          <Field label="Email" htmlFor="ac-email" error={errors.email}>
            <TextInput
              id="ac-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              error={errors.email}
            />
          </Field>
        </div>
        <Field label="Notes" htmlFor="ac-notes" hint="Optional — anything useful about this customer.">
          <TextArea
            id="ac-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Preferences, context, etc."
            rows={3}
          />
        </Field>
      </form>
    </Modal>
  );
}
