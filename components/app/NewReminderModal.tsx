"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageSquare, AlertCircle, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, Select, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { customersApi } from "@/lib/api/customers";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import {
  remindersApi,
  previewReminderMessage,
  type ReminderType,
  type ReminderRecurrence,
  type CreateReminderInput,
} from "@/lib/api/reminders";
import { ApiError } from "@/lib/api/client";

type Errors = Partial<Record<"customerId" | "message" | "scheduledAt", string>>;

const todayPlusOneHourIso = () => {
  const d = new Date();
  d.setHours(d.getHours() + 1, 0, 0, 0);
  return d.toISOString().slice(0, 16);
};

const DEFAULT_TEMPLATES: Record<ReminderType, string> = {
  REFILL_DUE:
    "Hi {firstName}, your {productName} refill is due. Visit {storeName} or order online at {websiteUrl}.",
  DRUG_USAGE:
    "Hi {firstName}, this is a reminder to take your {productName}. — {storeName}",
  FOLLOW_UP:
    "Hi {firstName}, checking in after your last visit. Reply or call us if anything changed. — {storeName}",
  CUSTOM: "",
};

/** Create a Brevo-backed SMS reminder for a customer (Spec v2 §12D).
 *  Template variables ({firstName}, {productName}, {storeName}, {websiteUrl})
 *  are interpolated server-side before the SMS goes out. We mirror the same
 *  logic client-side for a faithful preview. */
export function NewReminderModal({
  open,
  onClose,
  tenantSlug,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  tenantSlug: string;
  onCreated?: () => void;
}) {
  const toast = useToast();
  const { data: me } = useApiQuery(meQuery);

  const customersQ = useApiQuery(() => customersApi.list({ size: 200 }));
  const productsQ = useApiQuery(() => inventoryApi.list({ size: 200 }));
  const customers = customersQ.data ?? [];
  const products: Product[] = productsQ.data ?? [];

  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [reminderType, setReminderType] = useState<ReminderType>("REFILL_DUE");
  const [message, setMessage] = useState(DEFAULT_TEMPLATES.REFILL_DUE);
  const [scheduledAt, setScheduledAt] = useState(todayPlusOneHourIso());
  const [recurrence, setRecurrence] = useState<ReminderRecurrence>("ONCE");
  const [recurrenceEnd, setRecurrenceEnd] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCustomerId("");
    setProductId("");
    setReminderType("REFILL_DUE");
    setMessage(DEFAULT_TEMPLATES.REFILL_DUE);
    setScheduledAt(todayPlusOneHourIso());
    setRecurrence("ONCE");
    setRecurrenceEnd("");
    setErrors({});
  }, [open]);

  // Swap the default body when the type changes — but only if the user
  // hasn't customised it (we detect by checking whether the current message
  // matches any of the known defaults).
  function applyType(next: ReminderType) {
    const isDefault = Object.values(DEFAULT_TEMPLATES).includes(message);
    setReminderType(next);
    if (isDefault) setMessage(DEFAULT_TEMPLATES[next]);
  }

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customers, customerId],
  );
  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId],
  );

  const previewCtx = {
    firstName: selectedCustomer?.name?.split(/\s+/)[0] || "Chinedu",
    productName: selectedProduct?.name || null,
    storeName: me?.tenant?.name || "your pharmacy",
    websiteUrl: me?.tenant?.subdomain
      ? `https://${me.tenant.subdomain}`
      : me?.tenant?.slug
        ? `https://${me.tenant.slug}.conddo.io`
        : "your website",
  };
  const preview = previewReminderMessage(message, previewCtx);

  function validate(): boolean {
    const next: Errors = {};
    if (!customerId) next.customerId = "Pick the customer this is for.";
    if (!message.trim()) next.message = "Message can't be empty.";
    if (!scheduledAt) next.scheduledAt = "Pick when to send.";
    else if (new Date(scheduledAt).getTime() < Date.now() - 60_000) {
      next.scheduledAt = "Schedule a time in the future.";
    }
    const cleaned = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setErrors(cleaned);
    return Object.keys(cleaned).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const body: CreateReminderInput = {
      customerId,
      productId: productId || undefined,
      reminderType,
      message: message.trim(),
      scheduledAt: new Date(scheduledAt).toISOString(),
      recurrence,
      recurrenceEnd: recurrenceEnd ? new Date(recurrenceEnd).toISOString() : null,
    };
    setSaving(true);
    try {
      await remindersApi.create(tenantSlug, body);
      toast.success(
        "Reminder scheduled",
        recurrence === "ONCE" ? "Will send once." : `Will repeat ${recurrence.toLowerCase()} until cancelled.`,
      );
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error(
        "Couldn't create reminder",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="Schedule reminder"
      description="Send an SMS to a customer at a chosen time. Use template variables — we'll fill them in for each send."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" type="submit" form="rem-form" disabled={saving}>
            {saving ? "Scheduling…" : "Schedule reminder"}
          </Button>
        </>
      }
    >
      <form id="rem-form" onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Customer" htmlFor="r-customer" required error={errors.customerId}>
            <Select
              id="r-customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            >
              <option value="">Pick a customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.phone ? ` — ${c.phone}` : ""}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Product" htmlFor="r-product" hint="Optional — auto-fills {productName}.">
            <Select
              id="r-product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">No product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Type" htmlFor="r-type">
          <Select
            id="r-type"
            value={reminderType}
            onChange={(e) => applyType(e.target.value as ReminderType)}
          >
            <option value="REFILL_DUE">Refill due</option>
            <option value="DRUG_USAGE">Drug usage</option>
            <option value="FOLLOW_UP">Follow-up</option>
            <option value="CUSTOM">Custom</option>
          </Select>
        </Field>

        <Field label="Message" htmlFor="r-message" required error={errors.message}>
          <TextArea
            id="r-message"
            value={message}
            error={errors.message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Hi {firstName}, your {productName} refill is due…"
          />
          <p className="mt-1.5 text-[11px] text-content-muted">
            Variables: <code className="rounded bg-neutral-surface2 px-1">{"{firstName}"}</code>{" "}
            <code className="rounded bg-neutral-surface2 px-1">{"{productName}"}</code>{" "}
            <code className="rounded bg-neutral-surface2 px-1">{"{storeName}"}</code>{" "}
            <code className="rounded bg-neutral-surface2 px-1">{"{websiteUrl}"}</code>
          </p>
        </Field>

        {message.trim() && (
          <div className="rounded-lg border border-primary/20 bg-primary-bg/40 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.04em] text-primary">
              <Sparkles size={11} /> Preview
            </div>
            <p className="flex items-start gap-2 text-[13px] text-content-secondary">
              <MessageSquare size={14} className="mt-0.5 shrink-0 text-content-muted" />
              <span>{preview}</span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Send at" htmlFor="r-when" required error={errors.scheduledAt}>
            <TextInput
              id="r-when"
              type="datetime-local"
              value={scheduledAt}
              error={errors.scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </Field>
          <Field label="Recurrence" htmlFor="r-recurrence">
            <Select
              id="r-recurrence"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as ReminderRecurrence)}
            >
              <option value="ONCE">One-time</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </Select>
          </Field>
        </div>

        {recurrence !== "ONCE" && (
          <Field
            label="Repeat until"
            htmlFor="r-end"
            hint="Optional — leave blank to recur indefinitely (until cancelled)."
          >
            <TextInput
              id="r-end"
              type="datetime-local"
              value={recurrenceEnd}
              onChange={(e) => setRecurrenceEnd(e.target.value)}
            />
          </Field>
        )}

        <p className="flex items-start gap-1.5 rounded-md bg-neutral-surface2 px-3 py-2 text-[11px] text-content-muted">
          <AlertCircle size={11} className="mt-0.5 shrink-0" />
          SMS is sent via your Brevo sender. Make sure the customer has a valid phone number on file.
        </p>
      </form>
    </Modal>
  );
}
