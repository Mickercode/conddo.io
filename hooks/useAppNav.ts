"use client";

import { useManifests } from "./useManifests";
import { APP_NAV } from "@/lib/app-nav";
import { iconFor } from "@/lib/manifest/icons";
import type { NavLink } from "@/lib/manifest/types";

/**
 * The sidebar's nav, manifest-driven (Architecture v1.0 §16) with a static fallback.
 * When the backend serves manifests for the tenant's active tools, nav is built from
 * them (sorted by `navItem.order`); until then it falls back to the canonical APP_NAV,
 * so the UI is unchanged today. Flipping to manifest-driven needs no further frontend work.
 */
export function useAppNav(): NavLink[] {
  const { manifests } = useManifests();
  if (!manifests) return APP_NAV;
  return manifests
    .flatMap((m) => m.navItems ?? [])
    .sort((a, b) => a.order - b.order)
    .map((n) => ({ label: n.label, href: n.path, icon: iconFor(n.icon) }));
}
