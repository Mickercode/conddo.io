"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ordersApi, type OrderActivity } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/client";

const fmtDateTime = (t: string) => {
  const d = new Date(t);
  return isNaN(d.getTime())
    ? t
    : d.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

/** Order activity timeline. Renders the activity nested on the GET-order
 *  payload by default; when the user clicks "Show full activity" it calls
 *  the dedicated `/orders/{id}/activity` endpoint and renders the full list
 *  in place — useful for long-running orders that have grown past the first
 *  page. */
export function OrderActivityLog({
  orderId,
  initial,
}: {
  orderId: string;
  initial: OrderActivity[];
}) {
  const toast = useToast();
  const [loaded, setLoaded] = useState<OrderActivity[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Heuristic — if the nested list is already short, there's nothing more to
  // load; we hide the "show full" CTA. BE returns up to ~10 nested by default.
  const NESTED_PAGE_LIKELY_FULL_AT = 6;

  async function loadFull() {
    setLoading(true);
    try {
      const { data } = await ordersApi.activity(orderId);
      setLoaded(data);
      if (data.length > initial.length) {
        toast.success("Full activity loaded", `${data.length - initial.length} more entr${data.length - initial.length === 1 ? "y" : "ies"}.`);
      } else {
        toast.toast({ tone: "info", title: "Nothing more", description: "The first page already had everything." });
      }
    } catch (err) {
      toast.error(
        "Couldn't load activity",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const items = loaded ?? initial;
  if (items.length === 0) return null;

  const canLoadMore =
    !loaded && initial.length >= NESTED_PAGE_LIKELY_FULL_AT;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-cinema-elev p-6">
      <div className="mb-6 flex items-center justify-between gap-2">
        <h3 className="text-[16px] font-medium text-white">Activity Log</h3>
        {loaded && (
          <span className="font-mono text-[11px] text-white/45">
            Showing all {loaded.length}
          </span>
        )}
      </div>

      <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-neutral-border">
        {items.map((e, i) => (
          <li key={e.id} className="relative flex gap-4">
            <span className={`z-10 mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border bg-cinema-elev ${i === 0 ? "border-primary" : "border-white/[0.06]"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-primary" : "bg-neutral-strong"}`} />
            </span>
            <div className="flex-1">
              <div className="mb-0.5 flex flex-wrap items-center justify-between gap-1">
                <p className="text-[14px] font-medium text-white">{e.title}</p>
                <span className="font-mono text-[10px] uppercase text-white/45">{fmtDateTime(e.at)}</span>
              </div>
              {(e.detail || e.actor) && (
                <p className="text-[12px] text-white/65">
                  {e.detail}
                  {e.actor ? ` · ${e.actor}` : ""}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {canLoadMore && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={loadFull}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-cinema-elev px-3 py-1.5 text-[12px] font-medium text-white/65 hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 size={12} className="animate-spin" /> Loading…</>
            ) : (
              <><ChevronDown size={12} /> Show full activity</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
