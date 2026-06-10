"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Loader2, Copy, Check, AlertCircle, ExternalLink } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useApiQuery } from "@/hooks/useApiQuery";
import {
  refillOffersApi,
  refillProductName,
  summariseOffer,
  type RefillOffer,
  type RefillOfferClaim,
} from "@/lib/api/refillOffers";
import { ApiError } from "@/lib/api/client";

function fmtExpiry(s: string): string {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString("en-NG", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/** Issue an existing refill offer to a customer (Spec v2 §12E) — picks an
 *  offer, optionally sends an SMS, and surfaces the generated code so the
 *  pharmacist can also share it verbally / on paper if needed. */
export function IssueRefillOfferModal({
  open,
  onClose,
  customerId,
  customerName,
}: {
  open: boolean;
  onClose: () => void;
  customerId: string;
  customerName?: string | null;
}) {
  const toast = useToast();
  const offersQ = useApiQuery(refillOffersApi.list);
  const offers = (offersQ.data ?? []).filter((o) => o.isActive);

  const [selected, setSelected] = useState<string>("");
  const [sendSms, setSendSms] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [claim, setClaim] = useState<RefillOfferClaim | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected("");
    setSendSms(true);
    setIssuing(false);
    setClaim(null);
    setCopied(false);
  }, [open]);

  // Auto-select the single offer if there's only one to choose from.
  useEffect(() => {
    if (open && offers.length === 1 && !selected) {
      setSelected(offers[0].id);
    }
  }, [open, offers, selected]);

  const selectedOffer = useMemo(
    () => offers.find((o) => o.id === selected),
    [offers, selected],
  );

  async function issue() {
    if (!selected) {
      toast.error("Pick an offer", "Select which refill offer to issue.");
      return;
    }
    setIssuing(true);
    try {
      const { data } = await refillOffersApi.issue(selected, { customerId, sendSms });
      setClaim(data);
      toast.success("Refill offer issued", sendSms ? "SMS sent to the customer." : "Share the code with the customer.");
    } catch (err) {
      toast.error(
        "Couldn't issue offer",
        err instanceof ApiError ? err.message : "Please try again.",
      );
    } finally {
      setIssuing(false);
    }
  }

  async function copy() {
    if (!claim?.offerCode) return;
    try {
      await navigator.clipboard.writeText(claim.offerCode);
      setCopied(true);
      toast.success("Code copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy", "Long-press the code to copy manually.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => !issuing && onClose()}
      title={claim ? "Offer issued" : "Issue refill offer"}
      description={claim
        ? "Share this code with your customer — they'll redeem it at checkout."
        : `Pick an offer to issue to ${customerName?.trim() || "this customer"}.`}
      footer={
        claim ? (
          <Button variant="primary" size="md" onClick={onClose}>Done</Button>
        ) : (
          <>
            <Button variant="secondary" size="md" onClick={onClose} disabled={issuing}>Cancel</Button>
            <Button variant="primary" size="md" onClick={issue} disabled={issuing || !selected}>
              {issuing ? <><Loader2 size={14} className="animate-spin" /> Issuing…</> : "Issue offer"}
            </Button>
          </>
        )
      }
    >
      {claim ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-success/20 bg-success-bg p-5 text-center">
            <p className="text-[11px] uppercase tracking-[0.06em] text-success">Redemption code</p>
            <p className="mt-2 font-mono text-[24px] font-bold tracking-[0.05em] text-ink">
              {claim.offerCode}
            </p>
            <button
              type="button"
              onClick={copy}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-success/30 bg-neutral-surface px-3 py-1.5 text-[12px] font-medium text-success hover:bg-success hover:text-white"
            >
              {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy code</>}
            </button>
          </div>
          <div className="rounded-md bg-neutral-surface2 px-3 py-2 text-[12px] text-content-secondary">
            <p className="flex items-center gap-1.5">
              <ExternalLink size={11} />
              Expires <strong className="font-medium text-ink">{fmtExpiry(claim.expiresAt)}</strong>
            </p>
            <p className="mt-1 flex items-start gap-1.5 text-content-muted">
              <AlertCircle size={11} className="mt-0.5 shrink-0" />
              {sendSms
                ? "We sent the customer an SMS with this code and a link to redeem online."
                : "No SMS was sent — share the code directly with the customer."}
            </p>
          </div>
        </div>
      ) : offersQ.loading ? (
        <div className="flex items-center justify-center py-8 text-content-muted">
          <Loader2 size={18} className="animate-spin" />
        </div>
      ) : offers.length === 0 ? (
        <div className="rounded-lg border border-neutral-border bg-neutral-surface2 p-5 text-center">
          <Gift size={20} className="mx-auto mb-2 text-content-muted" />
          <p className="text-[14px] font-medium text-ink">No active refill offers</p>
          <p className="mt-1 text-[13px] text-content-muted">
            Create one on the Refill offers page first, then issue it from here.
          </p>
          <a
            href="/marketing/refill-offers"
            className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-primary hover:underline"
          >
            Go to Refill offers <ExternalLink size={12} />
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[12px] font-medium text-content-secondary">Offer</p>
            <div className="overflow-hidden rounded-lg border border-neutral-border">
              <ul className="max-h-64 divide-y divide-neutral-border overflow-y-auto bg-neutral-surface">
                {offers.map((o) => {
                  const isSelected = selected === o.id;
                  return (
                    <li key={o.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(o.id)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                          isSelected ? "bg-primary-bg" : "hover:bg-neutral-surface2"
                        }`}
                      >
                        <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected ? "border-primary bg-primary text-white" : "border-neutral-border"
                        }`}>
                          {isSelected && <Check size={10} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-ink">
                            {refillProductName(o.product)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-content-muted">{summariseOffer(o)}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-border bg-neutral-surface px-4 py-3">
            <input
              type="checkbox"
              checked={sendSms}
              onChange={(e) => setSendSms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-border text-primary focus:ring-primary"
            />
            <div>
              <p className="text-[13px] font-medium text-ink">Send SMS to the customer</p>
              <p className="mt-0.5 text-[12px] text-content-muted">
                Uses your Brevo sender. Untick to share the code in person.
              </p>
            </div>
          </label>

          {selectedOffer && (
            <div className="rounded-md bg-neutral-surface2 px-3 py-2 text-[12px] text-content-secondary">
              <p className="flex items-start gap-1.5">
                <Gift size={12} className="mt-0.5 shrink-0 text-content-muted" />
                <span>
                  After issuing, we'll generate a short code (e.g. <code className="rounded bg-neutral-surface px-1 font-mono">REFILL-XY7Z</code>)
                  valid for {selectedOffer.validDays} day{selectedOffer.validDays === 1 ? "" : "s"}. The customer redeems it at checkout.
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
