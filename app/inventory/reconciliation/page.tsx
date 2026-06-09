"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardCheck, Loader2, AlertCircle, History } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import { meQuery } from "@/lib/api/account";
import { verticalOf } from "@/lib/verticalCopy";
import {
  pharmacyInventoryApi,
  RECONCILIATION_RESUME_KEY,
} from "@/lib/api/pharmacyInventory";
import { ApiError } from "@/lib/api/client";

/** Landing for inventory reconciliation. BE doesn't ship a list endpoint
 *  yet, so we surface "Start new" + an optional "Resume previous" CTA
 *  driven by the last reconciliation id we cached in localStorage for
 *  this browser. Completing a reconciliation clears the cache. */
export default function ReconciliationLandingPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: me } = useApiQuery(meQuery);
  const isPharmacy = verticalOf(me) === "pharmacy";

  const [note, setNote] = useState("");
  const [starting, setStarting] = useState(false);
  const [resume, setResume] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(RECONCILIATION_RESUME_KEY);
    if (stored) setResume(stored);
  }, []);

  async function start() {
    setStarting(true);
    try {
      const { data } = await pharmacyInventoryApi.startReconciliation(note.trim() || undefined);
      window.localStorage.setItem(RECONCILIATION_RESUME_KEY, data.reconciliationId);
      toast.success("Reconciliation started", `Snapshot taken for ${data.totalProducts} product${data.totalProducts === 1 ? "" : "s"}.`);
      router.push(`/inventory/reconciliation/${data.reconciliationId}`);
    } catch (err) {
      toast.error(
        "Couldn't start reconciliation",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <AppShell title="Stock reconciliation" subtitle="Compare physical stock to what Conddo expects, and apply the variances.">
      <Link
        href="/inventory"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-content-secondary hover:text-ink"
      >
        <ArrowLeft size={14} /> Back to Inventory
      </Link>

      {!isPharmacy ? (
        <EmptyState
          icon={ClipboardCheck}
          title="Reconciliation is pharmacy-only"
          description="The variance-and-apply workflow is built for pharmacy stock-counts today. Other verticals get a simpler per-product Adjust action on the inventory page."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {resume && (
            <div className="rounded-xl border border-warning/20 bg-warning-bg/40 p-5">
              <div className="mb-2 flex items-center gap-2">
                <History size={16} className="text-warning" />
                <p className="text-[14px] font-medium text-ink">Continue previous session</p>
              </div>
              <p className="mb-4 text-[13px] text-content-secondary">
                You started a reconciliation in this browser but didn't finish. Pick up where you left off, or start a fresh one.
              </p>
              <Link
                href={`/inventory/reconciliation/${resume}`}
                className="inline-flex items-center gap-1.5 rounded-md border border-warning/40 bg-neutral-surface px-3 py-1.5 text-[13px] font-medium text-warning hover:bg-warning hover:text-white"
              >
                Resume reconciliation
              </Link>
            </div>
          )}

          <div className={`rounded-xl border border-neutral-border bg-neutral-surface p-5 ${resume ? "" : "lg:col-span-2"}`}>
            <div className="mb-2 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-primary" />
              <p className="text-[14px] font-medium text-ink">Start a new reconciliation</p>
            </div>
            <p className="mb-4 text-[13px] text-content-secondary">
              We'll snapshot the current stock for every active product. You then count each one physically, submit the totals, and Conddo applies the variances as RECONCILIATION movements in your audit log.
            </p>
            <Field label="Note" htmlFor="rec-note" hint="Optional — context for the audit log (e.g. &ldquo;Monthly physical count — June 2026&rdquo;).">
              <TextInput
                id="rec-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Monthly physical count — June 2026"
              />
            </Field>
            <Button
              variant="primary"
              size="md"
              onClick={start}
              disabled={starting}
              className="mt-4"
            >
              {starting ? (
                <><Loader2 size={14} className="animate-spin" /> Starting…</>
              ) : (
                <>Start reconciliation</>
              )}
            </Button>
            <p className="mt-3 flex items-start gap-1.5 text-[11px] text-content-muted">
              <AlertCircle size={11} className="mt-0.5 shrink-0" />
              The snapshot freezes <strong>current</strong> system quantities the moment you start. Any sales that happen during the count will still deduct stock — we'll reconcile based on what you counted vs the live number when you complete.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  );
}
