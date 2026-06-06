"use client";

import { useEffect, useState } from "react";
import { Sparkles, Clock, Image as ImageIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, TextArea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { naira } from "@/lib/format";
import {
  creativeApi,
  FALLBACK_OFFERINGS,
  type CreativeOffering,
  type OfferingCode,
} from "@/lib/api/creative";
import { ApiError } from "@/lib/api/client";

const koboToNaira = (k: number) => Math.round(k / 100);

/** Request a paid creative service (per spec §5). Tenant picks an offering,
 *  writes a brief, attaches raw media (passed in from the composer or
 *  picked here), and submits. The BE returns either:
 *    - checkoutUrl → redirect to RoutePay (per-job pay)
 *    - null → the request is already queued because the tenant has a
 *      Brand Package quota covering it. */
export function NewCreativeRequestModal({
  open,
  onClose,
  attachedMediaIds: initialAttached = [],
  socialPostId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  /** Pre-attach media that's already on the post. The brief can attach more. */
  attachedMediaIds?: string[];
  /** Link the request to the post the user was just composing. */
  socialPostId?: string | null;
  onCreated?: () => void;
}) {
  const toast = useToast();
  const [offerings, setOfferings] = useState<CreativeOffering[]>(FALLBACK_OFFERINGS);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [code, setCode] = useState<OfferingCode>(FALLBACK_OFFERINGS[0].code);
  const [brief, setBrief] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);
  const attachedIds = initialAttached;

  // Try the live catalog; fall back to the bundled defaults if BE isn't ready.
  useEffect(() => {
    if (!open) return;
    setLoadingCatalog(true);
    creativeApi
      .offerings()
      .then(({ data }) => {
        if (Array.isArray(data) && data.length > 0) setOfferings(data);
      })
      .catch(() => {
        // BE not ready → silently keep the bundled fallback.
      })
      .finally(() => setLoadingCatalog(false));
  }, [open]);

  function close() {
    if (saving) return;
    setCode(offerings[0]?.code ?? FALLBACK_OFFERINGS[0].code);
    setBrief("");
    setError(undefined);
    onClose();
  }

  const selected = offerings.find((o) => o.code === code) ?? offerings[0];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!brief.trim()) {
      setError("Tell us what you need — even a few lines helps.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await creativeApi.createRequest({
        offeringCode: code,
        brief: brief.trim(),
        attachedMediaIds: attachedIds,
        socialPostId: socialPostId ?? undefined,
      });
      if (data.checkoutUrl) {
        // Per-job pay → redirect to RoutePay checkout.
        toast.success("Redirecting to checkout…");
        window.location.href = data.checkoutUrl;
      } else {
        // Brand Package quota covered this one.
        toast.success("Request queued", "Your designer will start within the offering's turnaround.");
        close();
        onCreated?.();
      }
    } catch (err) {
      // BE not ready / 5xx → friendly message.
      const msg = err instanceof ApiError ? err.message : "Please try again.";
      toast.error("Creative services launching soon", msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Request creative help"
      description="Tell us what you need and we'll route it to a Conddo designer."
      footer={
        <>
          <Button variant="secondary" size="md" onClick={close} disabled={saving}>Cancel</Button>
          <Button variant="primary" size="md" type="submit" form="new-creative-form" disabled={saving}>
            {saving ? "Sending…" : selected ? `Continue · ${naira(koboToNaira(selected.priceKobo))}` : "Continue"}
          </Button>
        </>
      }
    >
      <form id="new-creative-form" onSubmit={submit} className="space-y-5">
        {/* Offering picker */}
        <Field label="What do you need?">
          {loadingCatalog && offerings === FALLBACK_OFFERINGS ? (
            <p className="text-[12px] text-content-muted">Loading services…</p>
          ) : null}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {offerings.map((o) => {
              const on = o.code === code;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setCode(o.code)}
                  className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors ${
                    on
                      ? "border-primary bg-primary-bg"
                      : "border-neutral-border bg-neutral-surface hover:border-primary-light"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className={`text-[13px] font-medium ${on ? "text-primary" : "text-ink"}`}>{o.name}</span>
                    <span className="font-mono text-[12px] text-content-secondary">{naira(koboToNaira(o.priceKobo))}</span>
                  </div>
                  <p className="text-[12px] text-content-muted">{o.description}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-content-muted">
                    <Clock size={11} /> {o.turnaroundHours <= 48 ? "Next 48h" : `${o.turnaroundHours}h turnaround`}
                  </p>
                </button>
              );
            })}
          </div>
        </Field>

        {/* Attached media count (informational) */}
        {attachedIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-neutral-border bg-neutral-surface2 px-3 py-2 text-[13px] text-content-secondary">
            <ImageIcon size={14} className="text-content-muted" />
            {attachedIds.length} file{attachedIds.length === 1 ? "" : "s"} from your post will be sent as reference.
          </div>
        )}

        {/* Brief */}
        <Field label="Brief" required error={error} hint="Tone, references, key message — even a few lines helps.">
          <TextArea
            id="nc-brief"
            value={brief}
            error={error}
            onChange={(e) => setBrief(e.target.value)}
            rows={5}
            placeholder="e.g. 'New collection launch — bold, warm tones. Use the photo of the Ankara dress. Caption to read: ‘Made for moments that matter.’'"
          />
        </Field>

        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary-bg px-3 py-2.5 text-[12px] text-primary">
          <Sparkles size={14} className="mt-0.5 shrink-0" />
          <span>
            On a Brand Package? Eligible requests are deducted from your monthly quota — no checkout needed.{" "}
            <a href="/settings/billing" className="font-medium underline hover:no-underline">View plan</a>
          </span>
        </div>
      </form>
    </Modal>
  );
}
