// Verticals — typed API surface for the BE Vertical registry.
//
// One endpoint today (no auth required — verticalConfig is public-readable
// since it powers signup/onboarding):
//   GET /api/v1/verticals/{id}/config
//
// Returns the default order stages, measurement fields, and website sections
// for the vertical. The FE consumes this in onboarding and as a source of
// truth for vertical-specific defaults (the registry-manifest path is for
// MODULE-level UI; verticalsApi.config is for VERTICAL-level defaults).

import { api } from "./client";

export type VerticalMeasurementField = {
  key: string;
  label: string;
  unit: string;
};

export type VerticalConfig = {
  id: string;
  name: string;
  /** Canonical pipeline stages — used as defaults on first-order create when
   *  the tenant hasn't customised stages yet. */
  orderStages: string[];
  /** Schema for the customer-detail measurements card — fashion shows
   *  bust/waist/hip, pharmacy shows nothing, music-studio shows nothing
   *  but a future BeautySpec shows skin-type/concerns, etc. */
  measurementFields: VerticalMeasurementField[];
  /** Default sections the website builder offers for this vertical (e.g.
   *  pharmacy gets a "Prescription Upload" section, fashion gets a
   *  "Lookbook" section). */
  websiteSections: string[];
};

export const verticalsApi = {
  config: (id: string) => api.get<VerticalConfig>(`/verticals/${encodeURIComponent(id)}/config`),
};
