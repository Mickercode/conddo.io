"use client";

import { useManifests } from "./useManifests";

// App-level routes always available regardless of plan/vertical.
const ALWAYS_ALLOWED = ["/dashboard", "/settings", "/search", "/notifications"];

/**
 * The active module nav-paths for the current tenant (from the manifest), or
 * `null` when the session is unguarded — i.e. there are no manifests, so nav
 * falls back to the static APP_NAV and every route stays reachable (older login
 * tokens without `activeModules`). When non-null, routes outside this set + the
 * always-allowed app routes should be blocked (Architecture §10 module access).
 */
export function useActiveModulePaths(): string[] | null {
  const { manifests } = useManifests();
  if (!manifests || manifests.length === 0) return null;
  return manifests.map((m) => m.navItem?.path).filter((p): p is string => Boolean(p));
}

/** Whether `pathname` is within the allowed module paths (+ always-allowed routes). */
export function isPathAllowed(pathname: string, modulePaths: string[]): boolean {
  return [...ALWAYS_ALLOWED, ...modulePaths].some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}
