import type { ReactNode } from "react";
import { isNotConfigured, isServerError, isPlanUpgradeRequired } from "@/lib/api/client";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { PlanGate, hintFromError } from "@/components/app/PlanGate";

/**
 * Standard state machine for an API-backed region: loading → error → empty → data.
 *
 * "Soft" errors get special handling:
 *  - api_not_configured / 5xx → render the page's empty state (the backend
 *    hasn't shipped this endpoint yet; show the designed "no data" UI rather
 *    than scaring the user).
 *  - PLAN_UPGRADE_REQUIRED (403) → render <PlanGate> with the BE's upgrade
 *    hint. The locked-state is the right UX, not a generic error.
 *
 * Hard errors (network, other 4xx) surface via <ErrorState>.
 */
export function QueryBoundary({
  loading,
  error,
  isEmpty,
  empty,
  onRetry,
  loadingLabel,
  gatedFeatureTitle,
  children,
}: {
  loading: boolean;
  error: Error | null;
  isEmpty: boolean;
  empty: ReactNode;
  onRetry?: () => void;
  loadingLabel?: string;
  /** Title shown on <PlanGate> when the error is PLAN_UPGRADE_REQUIRED.
   *  Defaults to "This feature". */
  gatedFeatureTitle?: string;
  children: ReactNode;
}) {
  if (loading) return <LoadingState label={loadingLabel} />;
  if (error) {
    // Plan-upgrade gets its own UI — not the generic error state.
    const hint = hintFromError(error);
    if (hint) return <PlanGate title={gatedFeatureTitle} hint={hint} />;
    // Treat "endpoint not configured / not deployed" as an empty state so the
    // page's designed empty UI shows instead of an error.
    const soft = isNotConfigured(error) || isServerError(error);
    if (!soft) return <ErrorState error={error} onRetry={onRetry} />;
  }
  if (error || isEmpty) return <>{empty}</>;
  return <>{children}</>;
}
