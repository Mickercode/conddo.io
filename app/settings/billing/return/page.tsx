"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { subscriptionsApi, type CheckoutVerifyResult } from "@/lib/api/subscriptions";
import { ApiError } from "@/lib/api/client";
import { naira } from "@/lib/format";

/** Paystack hosted-checkout return URL for subscription upgrades. Mirrors
 *  /payments/return (which RoutePay uses for tenant→customer payments).
 *  Paystack bounces the user back here with `?reference=` after the hosted
 *  checkout; we poll /billing/verify until terminal, then show success or
 *  let them retry.
 *
 *  Lives at /settings/billing/return — only this page handles subscription
 *  callbacks; /payments/return continues to handle customer payments. */
export default function BillingReturnPage() {
  return (
    <Suspense fallback={<ReturnShell />}>
      <BillingReturnInner />
    </Suspense>
  );
}

function ReturnShell() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cinema-base px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-cinema-elev p-8">
        <div className="mb-5 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
        <h1 className="text-center text-[22px] font-medium leading-tight tracking-[-0.01em] text-white">
          Verifying your subscription…
        </h1>
      </div>
    </main>
  );
}

function BillingReturnInner() {
  const params = useSearchParams();
  // Paystack always sends `reference`; `trxref` is a legacy alias — accept both.
  const reference = params.get("reference") ?? params.get("trxref");
  const [result, setResult] = useState<CheckoutVerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!reference) {
      setError("Missing payment reference. Open Billing to retry your upgrade.");
      return;
    }
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async (n: number) => {
      try {
        const { data } = await subscriptionsApi.verify(reference);
        if (cancelled) return;
        setResult(data);
        if (data.status === "pending" && n < 40) {
          timer = setTimeout(() => tick(n + 1), n < 20 ? 3_000 : 10_000);
          setAttempt(n + 1);
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setError("We can't find that subscription transaction. It may have already been resolved.");
        } else {
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
    <main className="flex min-h-screen items-center justify-center bg-cinema-base px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-cinema-elev p-8">
        <View result={result} error={error} attempt={attempt} reference={reference} />
      </div>
    </main>
  );
}

function View({
  result, error, attempt, reference,
}: {
  result: CheckoutVerifyResult | null;
  error: string | null;
  attempt: number;
  reference: string | null;
}) {
  if (error) {
    return (
      <Box icon={<AlertCircle className="text-amber-300" size={36} />} title="Something's off">
        <p className="mb-5 text-center text-[14px] text-white/65">{error}</p>
        <Link href="/settings/billing" className="block">
          <Button variant="primary" size="md" className="w-full">Back to Billing</Button>
        </Link>
      </Box>
    );
  }

  if (!result) {
    return (
      <Box icon={<Loader2 className="animate-spin text-primary" size={36} />} title="Confirming your subscription…">
        <p className="text-center text-[14px] text-white/65">
          This usually takes a few seconds.
        </p>
        {reference && <p className="mt-4 text-center font-mono text-[11px] text-white/45">Ref: {reference}</p>}
      </Box>
    );
  }

  if (result.status === "success") {
    return (
      <Box icon={<CheckCircle2 className="text-emerald-300" size={40} />} title="Subscription activated">
        <p className="mb-1 text-center text-[14px] text-white/65">
          You're now on the <span className="font-medium text-white">{result.subscription?.planDisplayName ?? "new"}</span> plan.
        </p>
        {typeof result.amount === "number" && (
          <p className="mb-5 text-center text-[13px] text-white/45">
            Charged <span className="font-mono text-white">{naira(result.amount)}</span>
            {result.subscription?.expiresAt && (
              <> · next renewal {new Date(result.subscription.expiresAt).toLocaleDateString("en-NG", { month: "long", day: "numeric", year: "numeric" })}</>
            )}
          </p>
        )}
        <Link href="/dashboard" className="block">
          <Button variant="primary" size="md" className="w-full">
            Go to dashboard <ArrowRight size={16} />
          </Button>
        </Link>
        {reference && <p className="mt-4 text-center font-mono text-[11px] text-white/45">Ref: {reference}</p>}
      </Box>
    );
  }

  if (result.status === "failed" || result.status === "abandoned") {
    return (
      <Box icon={<XCircle className="text-rose-200" size={40} />} title="Subscription not activated">
        <p className="mb-5 text-center text-[14px] text-white/65">
          {result.failureReason ?? "Your payment didn't go through. Your card was not charged."}
        </p>
        <Link href="/settings/billing" className="block">
          <Button variant="primary" size="md" className="w-full">Try again</Button>
        </Link>
        {reference && <p className="mt-4 text-center font-mono text-[11px] text-white/45">Ref: {reference}</p>}
      </Box>
    );
  }

  // pending — keep waiting
  return (
    <Box icon={<Clock className="text-amber-300" size={36} />} title="Still pending">
      <p className="text-center text-[14px] text-white/65">
        Waiting for confirmation from Paystack. Attempt {attempt}/40 — usually under 30 seconds.
      </p>
      {reference && <p className="mt-4 text-center font-mono text-[11px] text-white/45">Ref: {reference}</p>}
    </Box>
  );
}

function Box({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <>
      <div className="mb-5 flex justify-center">{icon}</div>
      <h1 className="mb-3 text-center text-[22px] font-medium leading-tight tracking-[-0.01em] text-white">{title}</h1>
      {children}
    </>
  );
}
