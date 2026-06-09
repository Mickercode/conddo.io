// Pharmacy AI assistant — typed API surface for Spec v2 §12C.
// Routes are tenant-scoped via the dashboard-slug pattern (the new style v2
// introduces); slug comes from `me.tenant.slug`.
//
// Endpoints:
//   POST /api/v1/dashboard/{slug}/pharmacy/ai/product-from-image
//     → { suggestion: AiProductSuggestion, confidence, note }
//   POST /api/v1/dashboard/{slug}/pharmacy/ai/description
//     → { description, warnings }
//
// Until BE ships the corresponding handlers, calls error gracefully and the
// FE surfaces a "Please try again later" toast — the modal stays usable.

import { api } from "./client";

/** Confidence tier returned alongside an image-based suggestion. */
export type AiConfidence = "high" | "medium" | "low";

/** What Claude extracts from a packaging image. All fields optional so a
 *  low-confidence read can still return partials without breaking the FE. */
export type AiProductSuggestion = {
  nameGeneric?: string;
  nameBrand?: string;
  description?: string;
  indications?: string;
  dosageGuidance?: string;
  warnings?: string;
  storage?: string;
  nafdacNumber?: string;
  brand?: string;
  requiresPrescription?: boolean;
  /** Slug-ish hint ("prescription", "otc", "vitamins", …) — FE best-effort
   *  matches to an existing tenant category by name. */
  suggestedCategory?: string;
};

export type AiSuggestFromImageResult = {
  suggestion: AiProductSuggestion;
  confidence: AiConfidence;
  /** Mandatory disclosure that the pharmacist must verify before saving. */
  note: string;
};

export type AiDescribeInput = {
  nameGeneric: string;
  nameBrand?: string;
  indications?: string;
};

export type AiDescribeResult = {
  description: string;
  warnings?: string;
};

/** Tenant-slug helper so callers don't hand-roll the path. */
const path = (slug: string, rest: string) =>
  `/dashboard/${encodeURIComponent(slug)}/pharmacy/ai${rest}`;

export const pharmacyAiApi = {
  /** Extract product details from an uploaded packaging image URL. */
  suggestFromImage: (slug: string, imageUrl: string) =>
    api.post<AiSuggestFromImageResult>(path(slug, "/product-from-image"), { imageUrl }),

  /** Generate / improve a product description from basic name + indications. */
  describe: (slug: string, body: AiDescribeInput) =>
    api.post<AiDescribeResult>(path(slug, "/description"), body),
};
