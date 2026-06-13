"use client";

import { useEffect, useState } from "react";
import { Loader2, Wallet, ScanLine } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { posApi, type PosSession } from "@/lib/api/pos";
import { ApiError } from "@/lib/api/client";

/** Open-shift gate — every POS day starts here. Cashier enters how much
 *  cash they're starting the till with so the close-of-day reconciliation
 *  has a baseline. Optional notes ("Morning shift", "Took over for Yemi"). */
export function OpenShiftModal({
  open,
  onClose,
  onOpened,
}: {
  open: boolean;
  onClose: () => void;
  onOpened?: (session: PosSession) => void;
}) {
  const toast = useToast();
  const [openingFloat, setOpeningFloat] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOpeningFloat("");
    setNotes("");
  }, [open]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const f = Number(openingFloat);
    if (!Number.isFinite(f) || f < 0) {
      toast.error("Enter the cash you're starting the till with");
      return;
    }
    setSaving(true);
    try {
      const { data } = await posApi.openSession({
        openingFloat: f,
        notes: notes.trim() || undefined,
      });
      toast.success("Shift opened", "You're ready to ring up sales.");
      onOpened?.(data);
      onClose();
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.code === "SESSION_ALREADY_OPEN") {
        toast.toast({
          tone: "info",
          title: "You already have an open shift",
          description: "Continuing in that session instead.",
        });
        onClose();
        return;
      }
      toast.error(
        "Couldn't open shift",
        apiErr?.message ?? "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !saving && onClose()}
      title="Open shift"
      description="Count the cash in the till and enter the total below. We'll reconcile against this when you close."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="open-shift-form" disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Opening…</> : (<><ScanLine size={14} /> Open shift</>)}
          </Button>
        </>
      }
    >
      <form id="open-shift-form" onSubmit={submit} className="space-y-4">
        <Field label="Opening float (₦)" htmlFor="op-float" required hint="The cash currently in the till.">
          <TextInput
            id="op-float"
            inputMode="decimal"
            value={openingFloat}
            onChange={(e) => setOpeningFloat(e.target.value)}
            placeholder="5000"
            autoFocus
          />
        </Field>

        <Field label="Notes" htmlFor="op-notes" hint="Optional — e.g. ‘morning shift’, ‘took over for Yemi’.">
          <TextArea
            id="op-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Morning shift"
          />
        </Field>

        <p className="flex items-start gap-1.5 rounded-md bg-white/[0.02] px-3 py-2 text-[11px] text-white/45">
          <Wallet size={11} className="mt-0.5 shrink-0" />
          At close-of-shift we'll subtract sales totals and ask you to count
          the cash again. Any difference shows up as a variance.
        </p>
      </form>
    </Modal>
  );
}
