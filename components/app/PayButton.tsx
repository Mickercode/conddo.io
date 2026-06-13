"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { paymentsApi, type InitPaymentInput, type PaymentStatus } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";

/**
 * "Pay with RoutePay" — opens the hosted checkout in a popup tab and polls
 * /payments/{ref}/verify until the row terminalises. Fires `onPaid` /
 * `onFailed` callbacks so the parent can refresh order / booking state.
 *
 * Designed to fail gracefully when the backend payments service isn't
 * reachable yet: on a 404 / "PAYMENTS_NOT_CONFIGURED", the button renders a
 * "Payments are being set up" message instead of throwing — so a tenant who
 * lands on the dashboard during a backend rollout doesn't see a broken UI.
 *
 * Polling cadence: every 3s for the first minute, then every 10s up to 5
 * minutes. Most RoutePay checkouts terminalise within 30s; the longer tail
 * covers webhook latency.
 */
export function PayButton({
  input,
  label = "Pay now",
  variant = "primary",
  size = "md",
  className,
  onPaid,
  onFailed,
}: {
  input: InitPaymentInput;
  label?: string;
  variant?: "primary" | "secondary";
  size?: "md" | "lg";
  className?: string;
  onPaid?: (reference: string) => void;
  onFailed?: (reference: string, reason: string | null) => void;
}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [polling, setPolling] = useState<string | null>(null);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (pollTimer.current) clearTimeout(pollTimer.current); }, []);

  async function start() {
    setBusy(true);
    try {
      const { data } = await paymentsApi.initCheckout(input);
      // Open in a new tab/popup — keeps the dashboard context intact.
      const popup = window.open(data.paymentUrl, "_blank", "noopener,noreferrer");
      if (!popup) {
        // Popup blocked → fall back to same-tab navigation.
        window.location.href = data.paymentUrl;
        return;
      }
      setPolling(data.reference);
      pollFor(data.reference, 0);
      toast.toast({ tone: "info", title: "Checkout opened", description: "Complete payment in the new tab." });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.code === "PAYMENTS_NOT_CONFIGURED")) {
        setUnavailable(true);
      } else {
        toast.error("Couldn't start checkout", err instanceof ApiError ? err.message : "Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  function pollFor(reference: string, attempt: number) {
    pollTimer.current = setTimeout(async () => {
      try {
        const { data } = await paymentsApi.verify(reference);
        if (isTerminal(data.status)) {
          setPolling(null);
          if (data.status === "PAID") {
            toast.success("Payment received", "Thanks!");
            onPaid?.(reference);
          } else if (data.status === "FAILED" || data.status === "EXPIRED") {
            toast.error("Payment didn't complete", data.failureReason ?? "Please try again.");
            onFailed?.(reference, data.failureReason);
          }
          return;
        }
        // Not terminal yet — keep polling, with the cadence ladder.
        const next = attempt + 1;
        // Stop after ~5 min total.
        if (next > 40) {
          setPolling(null);
          toast.toast({ tone: "info", title: "Still pending", description: "You can refresh later to see the latest status." });
          return;
        }
        pollFor(reference, next);
      } catch {
        // Network blip — try again on the next tick rather than erroring out.
        pollFor(reference, attempt + 1);
      }
    }, attempt < 20 ? 3_000 : 10_000);
  }

  if (unavailable) {
    return (
      <div className={`inline-flex items-center gap-2 rounded-md border border-warning/20 bg-amber-500/15 px-3 py-2 text-[13px] text-amber-300 ${className ?? ""}`}>
        <AlertCircle size={15} /> Payments are being set up — check back shortly.
      </div>
    );
  }

  return (
    <Button
      variant={variant} size={size}
      onClick={start}
      disabled={busy || polling !== null}
      className={className}
    >
      {busy ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
      {polling ? "Waiting for payment…" : busy ? "Opening checkout…" : label}
    </Button>
  );
}

function isTerminal(s: PaymentStatus): boolean {
  return s === "PAID" || s === "FAILED" || s === "EXPIRED" || s === "REFUNDED";
}
