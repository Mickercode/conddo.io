"use client";

import { useState } from "react";
import { Lock, Check, Loader2, ArrowRight } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { useToast } from "@/components/ui/Toast";
import {
  featuresApi,
  type FeatureCatalogueEntry,
} from "@/lib/api/features";
import { ApiError } from "@/lib/api/client";

// Local-only memory of which features the tenant has already requested in
// this browser session, so the CTA flips to a confirmed "on the list" state
// without a page refresh and survives a re-render of the parent list.
const inFlight = new Set<string>();

/** Renders one feature in its locked state — used for both Beta and Coming
 *  Soon entries from the pharmacy roadmap. Clicking the CTA registers
 *  interest / requests access; the button then locks into a confirmed pill.
 *
 *  Designed to slot inline anywhere — overview pages, in-section teasers,
 *  dashboard widgets — not just the dedicated /features page. */
export function FeatureLockedCard({
  feature,
  /** When the parent owns the requested state (e.g. a list view that wants
   *  the chip to stay confirmed across remounts), pass `requested` and the
   *  card uses it instead of its internal state. */
  requested,
  onRequested,
}: {
  feature: FeatureCatalogueEntry;
  requested?: boolean;
  onRequested?: (key: string) => void;
}) {
  const toast = useToast();
  const [local, setLocal] = useState<boolean>(() => inFlight.has(feature.key));
  const [busy, setBusy] = useState(false);
  const isRequested = requested ?? local;

  const isBeta = feature.status === "beta";
  const Icon = feature.icon;

  async function onClick() {
    setBusy(true);
    try {
      if (isBeta) {
        await featuresApi.requestBetaAccess(feature.key);
        toast.success(
          "Beta access requested",
          "We'll review and grant access shortly.",
        );
      } else {
        await featuresApi.notifyInterest(feature.key);
        toast.success(
          "You're on the list",
          "We'll notify you when this is ready.",
        );
      }
      inFlight.add(feature.key);
      setLocal(true);
      onRequested?.(feature.key);
    } catch (err) {
      toast.error(
        isBeta ? "Couldn't request access" : "Couldn't register interest",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-white/[0.06] bg-cinema-elev p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
          <Icon size={20} />
        </span>
        <Chip tone={isBeta ? "primary" : "neutral"}>
          <span className="inline-flex items-center gap-1">
            {isBeta ? <Lock size={10} /> : null}
            {isBeta ? "Beta" : "Coming Soon"}
          </span>
        </Chip>
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-medium text-white">{feature.name}</p>
        <p className="mt-1 text-[13px] text-white/65">{feature.description}</p>
      </div>
      <div>
        {isRequested ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-1 text-[12px] font-medium text-emerald-300">
            <Check size={13} /> {isBeta ? "Request submitted" : "You're on the list"}
          </span>
        ) : (
          <button
            type="button"
            onClick={onClick}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/[0.08] px-3 py-1.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-60"
          >
            {busy ? (
              <><Loader2 size={12} className="animate-spin" /> Sending…</>
            ) : (
              <>
                {isBeta ? "Request Beta access" : "Notify me when it's ready"}
                <ArrowRight size={12} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
