"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Wallet, AlertCircle, ShoppingBag, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import { posApi, type PosSession } from "@/lib/api/pos";
import { ApiError } from "@/lib/api/client";
import { naira } from "@/lib/format";

/** End-of-shift reconciliation. The expected cash = openingFloat + totalCash
 *  collected in cash payments. Cashier counts the drawer and we surface the
 *  variance in real time so they can recount before submitting. */
export function CloseShiftModal({
  open,
  onClose,
  session,
  onClosed,
}: {
  open: boolean;
  onClose: () => void;
  session: PosSession | null;
  onClosed?: () => void;
}) {
  const toast = useToast();
  const [countedCash, setCountedCash] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCountedCash("");
    setNotes("");
  }, [open]);

  const expectedCash = useMemo(() => {
    if (!session) return 0;
    return Number(session.openingFloat) + Number(session.summary?.totalCash ?? 0);
  }, [session]);

  const variance = useMemo(() => {
    if (!countedCash) return null;
    const c = Number(countedCash);
    if (!Number.isFinite(c)) return null;
    return c - expectedCash;
  }, [countedCash, expectedCash]);

  if (!session) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const c = Number(countedCash);
    if (!Number.isFinite(c) || c < 0) {
      toast.error("Enter the cash in the till");
      return;
    }
    setSaving(true);
    try {
      await posApi.closeSession(session!.id, {
        countedCash: c,
        notes: notes.trim() || undefined,
      });
      toast.success("Shift closed", "Receipts archived. Have a good evening.");
      onClosed?.();
      onClose();
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.code === "SESSION_HAS_OPEN_SALES") {
        toast.error(
          "There's a sale still open",
          "Complete or void any open sale before closing the shift.",
        );
        return;
      }
      toast.error(
        "Couldn't close shift",
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
      title="Close shift"
      description="Count the cash in the till and we'll reconcile."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="close-shift-form" disabled={saving}>
            {saving ? <><Loader2 size={14} className="animate-spin" /> Closing…</> : (<><CheckCircle2 size={14} /> Close shift</>)}
          </Button>
        </>
      }
    >
      <form id="close-shift-form" onSubmit={submit} className="space-y-4">
        {/* Today's totals */}
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.05em] text-white/45">Opening float</p>
              <p className="mt-0.5 font-mono text-[14px] text-white">{naira(session.openingFloat)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.05em] text-white/45">Cash sales</p>
              <p className="mt-0.5 font-mono text-[14px] text-emerald-300">+ {naira(session.summary?.totalCash ?? 0)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-dashed border-white/[0.06] pt-3">
            <span className="inline-flex items-center gap-1.5 text-[12px] text-white/65">
              <Wallet size={12} /> Expected in till
            </span>
            <span className="font-mono text-[16px] font-medium text-white">{naira(expectedCash)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <ShoppingBag size={11} /> {session.summary?.salesCount ?? 0} sale{session.summary?.salesCount === 1 ? "" : "s"} · transfers {naira(session.summary?.totalTransfer ?? 0)}
            </span>
          </div>
        </div>

        <Field label="Counted cash (₦)" htmlFor="cs-count" required hint="What's actually in the till right now.">
          <TextInput
            id="cs-count"
            inputMode="decimal"
            value={countedCash}
            onChange={(e) => setCountedCash(e.target.value)}
            placeholder={String(expectedCash)}
            autoFocus
          />
        </Field>

        {/* Live variance — surfaces BEFORE submit so cashier can recount */}
        {variance != null && variance !== 0 && (
          <div className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
            Math.abs(variance) < 100
              ? "border-warning/30 bg-amber-500/15"
              : "border-danger/30 bg-rose-500/[0.06]"
          }`}>
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className={Math.abs(variance) < 100 ? "text-amber-300" : "text-rose-200"} />
              <span className="text-[12px] text-white/65">Variance</span>
            </div>
            <div className="text-right">
              <Chip tone={variance > 0 ? "success" : "danger"}>
                {variance > 0 ? "+" : ""}{naira(variance)}
              </Chip>
              <p className="mt-0.5 text-[10px] text-white/45">
                {variance > 0 ? "Over" : "Short"} by {naira(Math.abs(variance))}
              </p>
            </div>
          </div>
        )}
        {variance === 0 && countedCash && (
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-emerald-500/15 px-3 py-2 text-[12px] text-emerald-300">
            <CheckCircle2 size={14} />
            Matches exactly — clean reconciliation.
          </div>
        )}

        <Field label="Notes" htmlFor="cs-notes" hint="Optional — explain any variance.">
          <TextArea
            id="cs-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. ₦100 over — customer overpaid by mistake, will reconcile tomorrow"
          />
        </Field>
      </form>
    </Modal>
  );
}
