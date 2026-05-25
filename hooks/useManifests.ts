"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { getAccessToken } from "@/lib/api/auth";
import { decodeJwt } from "@/lib/jwt";
import type { UIManifest } from "@/lib/manifest/types";

// Module-level cache so the manifests are fetched once per session, not per hook use.
let cache: UIManifest[] | null = null;

/**
 * Fetches the tenant's UI manifests (Architecture v1.0 §16) for the modules in the
 * JWT's `activeModules` claim. Returns `null` (→ caller falls back to the static
 * APP_NAV) when the claim/endpoint isn't available yet — which is the case until
 * the backend ships `activeModules` + `GET /api/v1/registry/manifests`.
 */
export function useManifests(): { manifests: UIManifest[] | null; loading: boolean } {
  const [manifests, setManifests] = useState<UIManifest[] | null>(cache);
  const [loading, setLoading] = useState(cache === null);

  useEffect(() => {
    if (cache) return;
    const modules = decodeJwt(getAccessToken())?.activeModules;
    // Backend doesn't emit activeModules / the registry endpoint yet → fall back.
    if (!modules || modules.length === 0) {
      setLoading(false);
      return;
    }
    let active = true;
    api
      .get<UIManifest[]>(`/registry/manifests?modules=${encodeURIComponent(modules.join(","))}`)
      .then((r) => {
        cache = r.data;
        if (active) setManifests(r.data);
      })
      .catch(() => {
        /* fall back to APP_NAV */
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { manifests, loading };
}
