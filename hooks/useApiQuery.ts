"use client";

import { useEffect, useState } from "react";
import type { Result } from "@/lib/api/types";

type QueryState<T> = {
  data: T | null;
  meta: Result<T>["meta"];
  loading: boolean;
  error: Error | null;
};

/**
 * Minimal data-fetching hook for client screens. Re-runs when `deps` change.
 * Mirrors a subset of SWR's shape so it can be swapped later without touching screens.
 */
export function useApiQuery<T>(fetcher: () => Promise<Result<T>>, deps: unknown[] = []) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    meta: undefined,
    loading: true,
    error: null,
  });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher()
      .then((r) => active && setState({ data: r.data, meta: r.meta, loading: false, error: null }))
      .catch((e) => active && setState({ data: null, meta: undefined, loading: false, error: e as Error }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  return { ...state, refetch: () => setNonce((n) => n + 1) };
}
