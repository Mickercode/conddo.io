// Frontend types for the Module Manifest System (Architecture v1.0 §16).
// The backend's Module Registry serves these per the tenant's active tools; the
// frontend builds nav / routes / dashboard widgets from them instead of hardcoding.

import type { LucideIcon } from "lucide-react";

export type WidgetZone = "metric" | "chart" | "list" | "sidebar" | "alert";

export type ManifestNavItem = {
  label: string;
  icon: string; // lucide-react icon name, resolved via lib/manifest/icons.ts
  path: string;
  order: number;
};

export type ManifestRoute = { path: string; component: string };

export type ManifestWidget = { component: string; zone: WidgetZone };

// Mirrors the backend's UiManifest record (conddo-core registry/UiManifest.java):
// one nav entry per tool/section, its routes, and any dashboard widgets.
export type UIManifest = {
  toolId: string;
  navItem: ManifestNavItem | null;
  routes: ManifestRoute[];
  widgets: ManifestWidget[];
};

/** A nav link the sidebar renders (icon already resolved to a component). */
export type NavLink = { label: string; href: string; icon: LucideIcon };
