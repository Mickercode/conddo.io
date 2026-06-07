// Creative services — typed API surface for the "I need this designed"
// marketplace. Spec: backend/SOCIAL_AND_CREATIVE_SERVICES_SPEC.md §5 + §6.
//
// Tenants pick an offering (graphic design / video edit / ad creative),
// write a brief, attach raw media, and pay. The request becomes a Studio
// job. Brand Package subscribers create requests against their monthly
// quota with no per-job charge.

import { api } from "./client";

// Offering codes seen in the live BE catalog (verified 2026-06-07). New
// codes can be added without an FE change — the code field is typed as a
// permissive string so we render whatever the BE returns.
export type OfferingCode =
  | "design_static"
  | "design_reels"
  | "ad_creative_static"
  | "ad_creative_video"
  | "brand_kit_starter"
  | (string & {});  // permissive — future codes don't break the type

export type CreativeOffering = {
  /** Optional — BE doesn't currently return an id (code is the unique key). */
  id?: string;
  code: OfferingCode;
  name: string;
  description: string;
  priceKobo: number;
  turnaroundHours: number;
  /** Routes the resulting Studio job to the right team. BE returns this on
   *  every offering; "CREATIVE_DESIGN" | "CREATIVE_AD" | "CREATIVE_VIDEO". */
  jobType?: string;
  /** BE doesn't return this — assume any offering in the response is active. */
  active?: boolean;
};

export type CreativeRequestStatus =
  | "pending_payment"
  | "queued"
  | "in_progress"
  | "delivered"
  | "cancelled";

export type CreativeRequest = {
  id: string;
  offeringId: string;
  offeringCode: OfferingCode;
  socialPostId: string | null;
  brief: string;
  attachedMediaIds: string[];
  priceKobo: number;
  status: CreativeRequestStatus;
  studioJobId: string | null;
  deliveryMediaUrls: string[];
  createdAt: string;
  deliveredAt: string | null;
};

export type CreateCreativeRequestInput = {
  offeringCode: OfferingCode;
  brief: string;
  attachedMediaIds?: string[];
  socialPostId?: string | null;
};

/** POST returns the request + a RoutePay checkout URL (per spec §5). When
 *  the tenant has an active Brand Package with quota left, the BE returns
 *  `checkoutUrl: null` and the request is already queued. */
export type CreateCreativeRequestResult = {
  request: CreativeRequest;
  checkoutUrl: string | null;
};

const PREFIX = "/creative-services";

export const creativeApi = {
  offerings: () => api.get<CreativeOffering[]>(`${PREFIX}/offerings`),
  requests: () => api.get<CreativeRequest[]>(`${PREFIX}/requests`),
  getRequest: (id: string) => api.get<CreativeRequest>(`${PREFIX}/requests/${id}`),
  createRequest: (body: CreateCreativeRequestInput) =>
    api.post<CreateCreativeRequestResult>(`${PREFIX}/requests`, body),
};

// FE-side fallback catalog mirroring the live BE catalog (verified 2026-06-07
// against /creative-services/offerings). Used only when the BE call fails;
// otherwise the modal renders whatever BE sends. Keep this in sync with the
// BE seed — if the BE adds or repriced an offering, update here too.
export const FALLBACK_OFFERINGS: CreativeOffering[] = [
  {
    code: "design_static",
    name: "Static Design",
    description: "A single static graphic for one platform (1080×1080 IG, 1200×630 FB, etc.)",
    priceKobo: 500_000,             // ₦5,000
    turnaroundHours: 24,
    jobType: "CREATIVE_DESIGN",
  },
  {
    code: "ad_creative_static",
    name: "Ad Creative (Static)",
    description: "A static ad creative tuned for paid Meta / Google placements, multiple aspect ratios",
    priceKobo: 800_000,              // ₦8,000
    turnaroundHours: 36,
    jobType: "CREATIVE_AD",
  },
  {
    code: "design_reels",
    name: "Reels / Vertical Video Edit",
    description: "A 15–60s vertical-format video edit from your raw footage, captions included",
    priceKobo: 1_500_000,             // ₦15,000
    turnaroundHours: 48,
    jobType: "CREATIVE_VIDEO",
  },
  {
    code: "ad_creative_video",
    name: "Ad Creative (Video)",
    description: "A short video ad creative for paid Meta / TikTok placements",
    priceKobo: 2_000_000,             // ₦20,000
    turnaroundHours: 60,
    jobType: "CREATIVE_AD",
  },
  {
    code: "brand_kit_starter",
    name: "Brand Starter Kit",
    description: "Logo refresh + colour palette + 5 templated post designs",
    priceKobo: 5_000_000,             // ₦50,000
    turnaroundHours: 72,
    jobType: "CREATIVE_DESIGN",
  },
];
