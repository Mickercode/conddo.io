// Per-tenant module opt-in surface — BE Phase B.
//
// The vertical chosen at signup defines a *starter preset* of modules; this
// surface lets the owner deviate from that preset, opting INTO a module the
// preset didn't include, or opting OUT of one that isn't useful for the
// tenant. The resolver feeds the JWT `activeModules` claim, so changes take
// effect on the **next login** (existing tokens hold the old claim until
// expiry). Spec: HANDOFF d2d68d2 §B.

import { api } from "./client";

export type ModuleState = {
  /** Dotted module identifier, e.g. "marketing.social", "crm.pharmacy",
   *  "pos.fashion" or the bare "website". */
  id: string;
  /** True if the module is currently active for the tenant. */
  enabled: boolean;
  /** True if the module is part of the tenant's vertical default preset.
   *  Drives the UI's "you've changed this" / "default state" copy. */
  inVerticalDefault: boolean;
  /** Where the current state comes from:
   *    - "vertical_default" — the tenant hasn't touched this; state matches
   *      the preset for their vertical.
   *    - "tenant_choice"   — the tenant has explicitly opted in or out. */
  source: "vertical_default" | "tenant_choice";
};

export const tenantModulesApi = {
  /** Full module catalogue across every vertical, with the calling
   *  tenant's current state per entry. Sorted by id ascending. */
  list: () => api.get<ModuleState[]>("/tenant/modules"),

  /** Opt IN to a module not in the vertical default (or undo a previous
   *  opt-out). Returns the updated row. */
  enable: (moduleId: string) =>
    api.post<ModuleState>(`/tenant/modules/${moduleId}/enable`),

  /** Opt OUT of a module — either one in the vertical default the tenant
   *  doesn't use, or one previously opted into. Returns the updated row. */
  disable: (moduleId: string) =>
    api.post<ModuleState>(`/tenant/modules/${moduleId}/disable`),
};
