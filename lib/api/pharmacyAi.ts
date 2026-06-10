// Pharmacy AI assistant — typed API surface for Spec v2 §12C.
//
// BE shipped paths (confirmed against PharmacyAiAssistantController):
//   POST /api/v1/pharmacy/ai/product-from-image
//   POST /api/v1/pharmacy/ai/description
// Tenant from JWT — no slug in the URL.

import { api } from "./client";

export type AiConfidence = "high" | "medium" | "low";

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
  suggestedCategory?: string;
};

export type AiSuggestFromImageResult = {
  suggestion: AiProductSuggestion;
  confidence: AiConfidence;
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

const BASE = "/pharmacy/ai";

export const pharmacyAiApi = {
  suggestFromImage: (imageUrl: string) =>
    api.post<AiSuggestFromImageResult>(`${BASE}/product-from-image`, { imageUrl }),

  describe: (body: AiDescribeInput) =>
    api.post<AiDescribeResult>(`${BASE}/description`, body),
};
