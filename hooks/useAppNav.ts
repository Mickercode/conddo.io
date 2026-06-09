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
 * The sidebar's nav (Architecture v1.0 §16). The backend serves a list of
 * UIManifests for the tenant's active tools (JWT `activeModules` →
 * GET /registry/manifests); we sort by `navItem.order` and bracket the result
 * with Home and Settings. The static APP_NAV is used only when the manifest
 * endpoint returns empty / the JWT pre-dates the `activeModules` claim — i.e.
 * the cold-cache or legacy-token fallback.
 */
export function useAppNav(): NavLink[] {
  const { manifests } = useManifests();

  const sections = (manifests ?? [])
    .map((m) => m.navItem)
    .filter((n): n is NonNullable<typeof n> => Boolean(n))
    .sort((a, b) => a.order - b.order)
    .map((n) => ({ label: n.label, href: n.path, icon: iconFor(n.icon) }));

  if (manifests && sections.length > 0) {
    return [HOME, ...sections, SETTINGS];
  }
  return APP_NAV;
}
