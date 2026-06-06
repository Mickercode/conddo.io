// Creative services — typed API surface for the "I need this designed"
// marketplace. Spec: backend/SOCIAL_AND_CREATIVE_SERVICES_SPEC.md §5 + §6.
//
// Tenants pick an offering (graphic design / video edit / ad creative),
// write a brief, attach raw media, and pay. The request becomes a Studio
// job. Brand Package subscribers create requests against their monthly
// quota with no per-job charge.

import { api } from "./client";

export type OfferingCode =
  | "design_static"
  | "design_carousel"
  | "design_reels"
  | "video_edit_short"
  | "video_edit_long"
  | "ad_creative_static"
  | "ad_creative_video";

export type CreativeOffering = {
  id: string;
  code: OfferingCode;
  name: string;
  description: string;
  priceKobo: number;        // in kobo
  turnaroundHours: number;
  active: boolean;
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

// FE-side fallback catalog used when the BE catalog endpoint isn't ready yet
// (returns 5xx → QueryBoundary degrades to empty). Lets the user still see
// what's coming, with realistic pricing. Replace once BE seeds the live
// catalog (spec §5 lists the BE seed shape).
export const FALLBACK_OFFERINGS: CreativeOffering[] = [
  {
    id: "fb-static",
    code: "design_static",
    name: "Static post (single image)",
    description: "One on-brand image, ready to post.",
    priceKobo: 700_000,           // ₦7,000
    turnaroundHours: 48,
    active: true,
  },
  {
    id: "fb-carousel",
    code: "design_carousel",
    name: "Carousel (3–5 slides)",
    description: "Sequenced visuals for swipeable Instagram + LinkedIn posts.",
    priceKobo: 1_800_000,          // ₦18,000
    turnaroundHours: 72,
    active: true,
  },
  {
    id: "fb-reels",
    code: "design_reels",
    name: "Reel / Short video graphic",
    description: "Vertical video graphic optimised for IG Reels + TikTok.",
    priceKobo: 2_500_000,          // ₦25,000
    turnaroundHours: 96,
    active: true,
  },
  {
    id: "fb-ad",
    code: "ad_creative_static",
    name: "Ad creative (static)",
    description: "Conversion-tuned ad image with CTA — ready for Meta Ads Manager.",
    priceKobo: 1_500_000,          // ₦15,000
    turnaroundHours: 72,
    active: true,
  },
];
