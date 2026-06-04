"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { paymentsApi, type VerifyResult, type PaymentStatus } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import { naira } from "@/lib/format";

/**
 * Public return-URL after RoutePay's hosted checkout. Customer lands here with
 * ?ref=<our-internal-ref>. We poll /verify until terminal (or 5 min). On PAID
 * we show success + a "back to your dashboard" CTA; on FAILED/EXPIRED we
 * offer "try again" (back to the order/booking the ref pointed at). Polite
 * loading state in between — RoutePay's webhook usually beats the customer's
 * redirect.
 *
 * Lives at /payments/return — works on the tenant subdomain (the FE is
 * deployed once and tenant subdomains share the same Vercel deployment, so
 * the slug context comes from the host header on the backend side).
 */
export default function PaymentsReturnPage() {
  const params = useSearchParams();
  const router = useRouter();
  const reference = params.get("ref");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!reference) {
      setError("Missing payment reference. Return to your order to try again.");
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async (n: number) => {
      try {
        const { data } = await paymentsApi.verify(reference);
        if (cancelled) return;
        setResult(data);
        if (!isTerminal(data.status) && n < 40) {
          timer = setTimeout(() => tick(n + 1), n < 20 ? 3_000 : 10_000);
          setAttempt(n + 1);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.code === "PAYMENTS_NOT_CONFIGURED") {
          setError("Payments are being set up. Talk to the business — your money has not been charged.");
        } else if (err instanceof ApiError && err.status === 404) {
          setError("We can't find that payment. It may have already been resolved.");
        } else {
          // Retry on transient errors.
          if (n < 40) timer = setTimeout(() => tick(n + 1), 5_000);
        }
      }
    };
    tick(0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [reference]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-bg px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-neutral-border bg-neutral-surface p-8">
        <View result={result} error={error} attempt={attempt} reference={reference} onTryAgain={() => router.back()} />
      </div>
    </main>
  );
}

function View({
  result, error, attempt, reference, onTryAgain,
}: {
  result: VerifyResult | null;
  error: string | null;
  attempt: number;
  reference: string | null;
  onTryAgain: () => void;
}) {
  if (error) {
    return (
      <Box icon={<AlertCircle className="text-warning" size={36} />} title="Something's off">
        <p className="mb-5 text-center text-[14px] text-content-secondary">{error}</p>
        <Button onClick={onTryAgain} variant="primary" size="md" className="w-full">Go back</Button>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box icon={<Loader2 className="animate-spin text-primary" size={36} />} title="Confirming your payment…">
        <p className="text-center text-[14px] text-content-secondary">
          This usually takes a few seconds.
        </p>
        {reference && <p className="mt-4 text-center font-mono text-[11px] text-content-muted">Ref: {reference}</p>}
      </Box>
    );
  }

  if (result.status === "PAID") {
    return (
      <Box icon={<CheckCircle2 className="text-success" size={40} />} title="Payment received">
        <p className="mb-1 text-center text-[14px] text-content-secondary">
          Thank you — your payment of <span className="font-mono text-ink">{naira(result.amount / 100)}</span> is in.
        </p>
        <p className="mb-5 text-center text-[13px] text-content-muted">
          The business has been notified and you'll get a confirmation email shortly.
        </p>
        <Link href="/dashboard" className="block">
          <Button variant="primary" size="md" className="w-full">
            Go to dashboard <ArrowRight size={16} />
          </Button>
        </Link>
        {reference && <p className="mt-4 text-center font-mono text-[11px] text-content-muted">Ref: {reference}</p>}
      </Box>
    );
  }

  if (result.status === "FAILED" || result.status === "EXPIRED") {
    return (
      <Box icon={<XCircle className="text-danger" size={40} />} title="Payment didn't complete">
        <p className="mb-5 text-center text-[14px] text-content-secondary">
          {result.failureReason ?? "Your payment didn't go through. Your card was not charged."}
        </p>
        <Button onClick={onTryAgain} variant="primary" size="md" className="w-full">
          Try again
        </Button>
        {reference && <p className="mt-4 text-center font-mono text-[11px] text-content-muted">Ref: {reference}</p>}
      </Box>
    );
  }

  // PENDING — keep waiting
  return (
    <Box icon={<Clock className="text-warning" size={36} />} title="Still pending">
      <p className="text-center text-[14px] text-content-secondary">
        We're waiting for confirmation from your bank. Attempt {attempt}/40 — usually less than 30 seconds.
      </p>
      {reference && <p className="mt-4 text-center font-mono text-[11px] text-content-muted">Ref: {reference}</p>}
    </Box>
  );
}

function Box({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="mb-5 flex justify-center">{icon}</div>
      <h1 className="mb-3 text-center text-[22px] font-medium leading-tight tracking-[-0.01em] text-ink">{title}</h1>
      {children}
    </>
  );
}

function isTerminal(s: PaymentStatus): boolean {
  return s === "PAID" || s === "FAILED" || s === "EXPIRED" || s === "REFUNDED";
}
