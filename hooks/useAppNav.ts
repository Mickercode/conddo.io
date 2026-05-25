"use client";

import { Home, Settings } from "lucide-react";
import { useManifests } from "./useManifests";
import { APP_NAV } from "@/lib/app-nav";
import { iconFor } from "@/lib/manifest/icons";
import type { NavLink } from "@/lib/manifest/types";

// App-level entries the tool catalogue doesn't own — always present, bracketing
// the manifest-driven tool sections.
const HOME: NavLink = { label: "Home", href: "/dashboard", icon: Home };
const SETTINGS: NavLink = { label: "Settings", href: "/settings", icon: Settings };

/**
 * The sidebar's nav (Architecture v1.0 §16). When the backend serves manifests for
 * the tenant's active tools (JWT `activeModules` → GET /registry/manifests), the
 * tool sections are built from them — sorted by `navItem.order` — and bracketed by
 * Home and Settings. Until then (e.g. a login token without `activeModules`, or a
 * failed/empty fetch) it falls back to the canonical APP_NAV, so the UI is unchanged.
 */
export function useAppNav(): NavLink[] {
  const { manifests } = useManifests();

  const sections = (manifests ?? [])
    .map((m) => m.navItem)
    .filter((n): n is NonNullable<typeof n> => Boolean(n))
    .sort((a, b) => a.order - b.order)
    .map((n) => ({ label: n.label, href: n.path, icon: iconFor(n.icon) }));

  // No manifests, or none mapped to a nav section → use the static nav.
  if (!manifests || sections.length === 0) return APP_NAV;

  return [HOME, ...sections, SETTINGS];
}
