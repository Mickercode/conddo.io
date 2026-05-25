import type { ReactNode } from "react";
import { isNotConfigured, isServerError } from "@/lib/api/client";
import { LoadingState, ErrorState } from "@/components/ui/States";

/**
 * Standard state machine for an API-backed region: loading → error → empty → data.
 * "Soft" errors (no backend wired yet, or a 5xx from an endpoint the backend hasn't
 * shipped) are treated as empty, so screens show their designed empty state rather
 * than a scary error during build-out. Hard errors (network, 4xx) still surface.
 */
export function QueryBoundary({
  loading,
  error,
  isEmpty,
  empty,
  onRetry,
  loadingLabel,
  children,
}: {
  loading: boolean;
  error: Error | null;
  isEmpty: boolean;
  empty: ReactNode;
  onRetry?: () => void;
  loadingLabel?: string;
  children: ReactNode;
}) {
  const soft = error ? isNotConfigured(error) || isServerError(error) : false;
  if (loading) return <LoadingState label={loadingLabel} />;
  if (error && !soft) return <ErrorState error={error} onRetry={onRetry} />;
  if (error || isEmpty) return <>{empty}</>;
  return <>{children}</>;
}
