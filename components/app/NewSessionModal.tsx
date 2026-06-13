"use client";

import { useEffect, useState } from "react";
import { Mic, Headphones, Music2, Sliders, Users, GraduationCap, MoreHorizontal, Wallet, type LucideIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { CustomerPicker } from "@/components/app/CustomerPicker";
import { bookingsApi, type BookingEvent, type SessionType } from "@/lib/api/bookings";
import { inventoryApi, type Product } from "@/lib/api/inventory";
import { useApiQuery } from "@/hooks/useApiQuery";
import { ApiError } from "@/lib/api/client";
import { naira } from "@/lib/format";

type Errors = Partial<Record<"customer" | "email" | "resource" | "date" | "time" | "deposit", string>>;

const SESSION_TYPES: { value: SessionType; label: string; icon: LucideIcon }[] = [
  { value: "RECORDING", label: "Recording", icon: Mic },
  { value: "MIXING", label: "Mixing", icon: Sliders },
  { value: "MASTERING", label: "Mastering", icon: Headphones },
  { value: "PODCAST", label: "Podcast", icon: Music2 },
  { value: "REHEARSAL", label: "Rehearsal", icon: Users },
  { value: "LESSON", label: "Lesson", icon: GraduationCap },
  { value: "OTHER", label: "Other", icon: MoreHorizontal },
];

const DURATIONS = [1, 2, 3, 4, 6, 8] as const;

const koboToNaira = (k: number) => Math.round(k / 100);
const nairaToKobo = (n: number) => Math.round(n * 100);

/** Schedule a music-studio session. Two paths share the same modal:
 *   1. Normal booking (`bookingsApi.create`) — no deposit, instant.
 *   2. Deposit-first booking (`bookingsApi.initWithDeposit`) — reserves
 *      the room, opens RoutePay checkout for the deposit. The customer
 *      pays before the slot is locked in. */
export function NewSessionModal({
  open,
  onClose,
  resources,
  defaultResourceId,
  defaultDate,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  resources: Product[];               // studio rooms from /inventory
  defaultResourceId?: string;
  defaultDate?: string;                // YYYY-MM-DD
  onCreated?: (booking: BookingEvent) => void;
}) {
  const toast = useToast();
  const [customer, setCustomer] = useState<{ id: string | null; name: string }>({ id: null, name: "" });
  const [customerEmail, setCustomerEmail] = useState("");
  const [resourceId, setResourceId] = useState(defaultResourceId ?? "");
  const [sessionType, setSessionType] = useState<SessionType>("RECORDING");
  const [date, setDate] = useState(defaultDate ?? "");
  const [time, setTime] = useState("");
  const [durationHours, setDurationHours] = useState<number>(2);
  const [collectDeposit, setCollectDeposit] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");  // ₦, what user types
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  // Suggest a deposit = 50% of total session cost when the user picks a
  // resource or changes duration. Editable.
  const resource = resources.find((r) => r.id === resourceId);
  const hourlyRate = resource?.price ?? 0;
  const sessionTotal = hourlyRate * durationHours;
  const suggestedDeposit = Math.round(sessionTotal * 0.5);

  useEffect(() => {
    if (!resource || depositAmount) return;
    setDepositAmount(String(suggestedDeposit));
  }, [resource, suggestedDeposit]);

  function reset() {
    setCustomer({ id: null, name: "" });
    setCustomerEmail("");
    setResourceId(defaultResourceId ?? "");
    setSessionType("RECORDING");
    setDate(defaultDate ?? "");
    setTime("");
    setDurationHours(2);
    setCollectDeposit(true);
    setDepositAmount("");
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
    if (!customer.id && !customer.name.trim()) next.customer = "Pick a customer or type a name.";
    if (collectDeposit && !customerEmail.trim()) next.email = "Email required for deposit checkout.";
    if (!resourceId) next.resource = "Pick a studio / room.";
    if (!date) next.date = "Pick a date.";
    if (!time) next.time = "Pick a start time.";
    if (collectDeposit) {
      const n = Number(depositAmount);
      if (!Number.isFinite(n) || n <= 0) next.deposit = "Enter a deposit amount.";
      else if (sessionTotal > 0 && n > sessionTotal) next.deposit = "Deposit can't exceed the session total.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const startDate = new Date(`${date}T${time}`);
    if (Number.isNaN(startDate.getTime())) {
      setErrors({ date: "Invalid date/time." });
      return;
    }
    const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    setSaving(true);
    try {
      if (collectDeposit) {
        const { data } = await bookingsApi.initWithDeposit({
          customerId: customer.id ?? undefined,
          customerName: customer.id ? undefined : customer.name.trim() || undefined,
          customerEmail: customerEmail.trim(),
          resourceId,
          sessionType,
          start: startIso,
          end: endIso,
          service: resource?.name ?? sessionType.toLowerCase(),
          amount: sessionTotal > 0 ? sessionTotal : undefined,
          depositAmountKobo: nairaToKobo(Number(depositAmount)),
          returnUrl: typeof window !== "undefined" ? `${window.location.origin}/sessions` : undefined,
          notes: notes.trim() || undefined,
        });
        toast.success("Reserved — sending you to checkout…");
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          // Edge case: BE didn't return a URL (subscriber on a deposit-free
          // tier?). Treat as a normal booking.
          onCreated?.(data.booking);
          reset();
          onClose();
        }
      } else {
        const { data } = await bookingsApi.create({
          customerId: customer.id ?? undefined,
          customerName: customer.id ? undefined : customer.name.trim() || undefined,
          service: resource?.name ?? sessionType.toLowerCase(),
          start: startIso,
          end: endIso,
          mode: "in-person",
          amount: sessionTotal > 0 ? sessionTotal : undefined,
          resourceId,
          sessionType,
          notes: notes.trim() || undefined,
        });
        toast.success("Session scheduled", `${customer.name} · ${resource?.name ?? ""}`);
        onCreated?.(data);
        reset();
        onClose();
      }
    } catch (err) {
      toast.error("Couldn't schedule the session", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Schedule a session"
      description="Block out studio time. Optionally collect a deposit before the slot is locked in."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="new-session-form" disabled={saving}>
            {saving ? "Scheduling…" : collectDeposit ? "Reserve + collect deposit" : "Schedule"}
          </Button>
        </>
      }
    >
      <form id="new-session-form" onSubmit={submit} className="space-y-4">
        <Field label="Customer" required error={errors.customer}>
          <CustomerPicker
            value={customer}
            error={errors.customer}
            onPick={(c) => {
              setCustomer({ id: c.id, name: c.name });
              if (c.email) setCustomerEmail(c.email);
            }}
            onTypeName={(name) => setCustomer({ id: null, name })}
          />
        </Field>

        {collectDeposit && (
          <Field label="Customer email" htmlFor="ns-email" required error={errors.email} hint="Where RoutePay sends the receipt.">
            <TextInput
              id="ns-email"
              type="email"
              value={customerEmail}
              error={errors.email}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </Field>
        )}

        <Field label="Studio / room" required error={errors.resource}>
          {resources.length === 0 ? (
            <p className="rounded-md border border-warning/30 bg-amber-500/15 px-3 py-2 text-[12px] text-amber-300">
              No rooms set up yet. Add studios to <a className="font-medium underline" href="/inventory">Inventory</a> first — each row's price becomes the hourly rate.
            </p>
          ) : (
            <Select id="ns-resource" value={resourceId} onChange={(e) => setResourceId(e.target.value)}>
              <option value="">Pick a room…</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {naira(r.price)}/hr
                </option>
              ))}
            </Select>
          )}
        </Field>

        <Field label="Session type" required>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SESSION_TYPES.map((s) => {
              const on = sessionType === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setSessionType(s.value)}
                  className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[12px] transition-colors ${
                    on ? "border-primary bg-primary/[0.08] font-medium text-primary" : "border-white/[0.06] text-white/65 hover:bg-white/[0.02]"
                  }`}
                >
                  <s.icon size={13} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Date" htmlFor="ns-date" required error={errors.date}>
            <TextInput id="ns-date" type="date" value={date} error={errors.date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Start time" htmlFor="ns-time" required error={errors.time}>
            <TextInput id="ns-time" type="time" value={time} error={errors.time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Duration" htmlFor="ns-dur">
            <Select id="ns-dur" value={String(durationHours)} onChange={(e) => setDurationHours(Number(e.target.value))}>
              {DURATIONS.map((h) => <option key={h} value={h}>{h} hour{h === 1 ? "" : "s"}</option>)}
            </Select>
          </Field>
        </div>

        {/* Cost summary — updates live as the user picks room + duration. */}
        {resource && (
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[13px]">
            <span className="text-white/65">
              {durationHours}h × {naira(hourlyRate)}/hr
            </span>
            <span className="font-mono text-white">{naira(sessionTotal)}</span>
          </div>
        )}

        {/* Deposit toggle + amount */}
        <Field label="Deposit">
          <label className="mb-3 flex items-start gap-2.5 rounded-lg border border-white/[0.06] bg-cinema-elev px-3 py-2.5 hover:bg-white/[0.02]">
            <input
              type="checkbox"
              checked={collectDeposit}
              onChange={(e) => setCollectDeposit(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/[0.06] text-primary focus:ring-primary"
            />
            <span>
              <span className="block text-[13px] font-medium text-white">Collect a deposit before reserving the slot</span>
              <span className="block text-[12px] text-white/45">Customer pays via RoutePay; the room is locked once payment confirms. Recommended — it's how studios stop ghost bookings.</span>
            </span>
          </label>
          {collectDeposit && (
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-white/45">₦</span>
              <TextInput
                id="ns-deposit"
                inputMode="numeric"
                value={depositAmount}
                error={errors.deposit}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder={String(suggestedDeposit)}
              />
              {sessionTotal > 0 && (
                <button
                  type="button"
                  onClick={() => setDepositAmount(String(suggestedDeposit))}
                  className="whitespace-nowrap rounded-md border border-white/[0.06] px-2.5 py-1.5 text-[11px] font-medium text-white/65 hover:bg-white/[0.02] hover:text-white"
                  title="Set to 50% of the session total"
                >
                  50% of total
                </button>
              )}
            </div>
          )}
          {collectDeposit && (
            <p className="mt-2 flex items-start gap-1.5 text-[11px] text-white/45">
              <Wallet size={12} className="mt-0.5 shrink-0" />
              On Submit, you'll be sent to RoutePay's hosted checkout. The customer pays from there.
            </p>
          )}
        </Field>

        <Field label="Notes" htmlFor="ns-notes">
          <TextArea
            id="ns-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Engineer assigned, gear setup, special requests."
          />
        </Field>
      </form>
    </Modal>
  );
}
