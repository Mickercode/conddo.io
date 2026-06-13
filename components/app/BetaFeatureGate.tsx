"use client";

import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useApiQuery } from "@/hooks/useApiQuery";
import { featuresApi } from "@/lib/api/features";

/** Lightweight per-feature gate. Reads the tenant's feature-flag set from
 *  BE; when the named feature isn't granted yet, renders a friendly
 *  "request access" surface in place of the children. Use anywhere a Beta
 *  feature's real UI should be gated — inline on a section, wrapping a page
 *  body, or around a single button.
 *
 *  While flags load (or if the endpoint errors), errs on the **gated** side
 *  so we never flash a Beta UI to a non-granted tenant. */
export function BetaFeatureGate({
  featureKey,
  featureName,
  description,
  children,
  /** When true, render the children optimistically while flags load so
   *  there's no "loading flash" on grants. Use only when the gated UI is
   *  itself expensive to render and the tenant is highly likely to have
   *  access. */
  optimistic = false,
}: {
  featureKey: string;
  featureName: string;
  description?: string;
  children: React.ReactNode;
  optimistic?: boolean;
}) {
  const { data: flags, loading } = useApiQuery(featuresApi.flags);
  const flag = flags?.find((f) => f.featureKey === featureKey);
  const enabled = Boolean(flag?.enabled);

  if (enabled) return <>{children}</>;
  if (loading && optimistic) return <>{children}</>;
  if (loading) return null;

  // BE says this feature is on the tenant's interest list but not enabled
  // yet — the request has been received but ops haven't granted. Show a
  // subtly different copy so the user knows it's pending review.
  const isRequested = Boolean(flag);

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.08]/30 p-8 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/[0.08] text-primary">
        {isRequested ? <Sparkles size={22} /> : <Lock size={22} />}
      </span>
      <h3 className="text-[16px] font-medium text-white">
        {featureName}
        <span className="ml-2 rounded bg-primary px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">
          BETA
        </span>
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-[13px] text-white/65">
        {description ?? "This is a beta pharmacy feature. Request access to start using it."}
      </p>
      {isRequested ? (
        <p className="mt-4 text-[12px] text-white/45">
          Your access request is being reviewed. We'll notify you when it's granted.
        </p>
      ) : (
        <Link href="/features" className="mt-4 inline-block">
          <Button variant="primary" size="md">
            Request Beta access
          </Button>
        </Link>
      )}
    </div>
  );
}
