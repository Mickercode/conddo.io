// Social integrations via Ayrshare — endpoints under /api/v1/marketing/social/*.
// BE spec: backend/SOCIAL_AND_CREATIVE_SERVICES_SPEC.md §2-§3.
// BE shipped: commits b7eccb0 + 2408c51.
//
// Auth flow: tenant clicks "Connect Facebook" → FE calls /connect-link →
// BE provisions an Ayrshare User Profile (one per tenant), returns the
// hosted-connect URL → FE redirects → user authorises inside Ayrshare's
// dialog → Ayrshare bounces back to
// app.<APP_DOMAIN>/settings/connections?reconnect=1 → FE refetches accounts.

import { api } from "./client";

export type AyrshareProvider =
  | "facebook" | "instagram" | "linkedin" | "twitter"
  | "tiktok" | "youtube" | "pinterest" | "gmb"
  | "threads" | "bluesky" | "telegram" | "reddit"
  | (string & {});

export type SocialAccountPlatform = {
  provider: AyrshareProvider;
  connected: boolean;
  /** Human label — page name, handle, "Acme Studios" etc. Null if not connected. */
  externalName?: string | null;
};

export type AccountsResponse = { platforms: SocialAccountPlatform[] };

export type ConnectLinkInput = {
  /** Provider hint — Ayrshare's hosted dialog can filter to a single platform.
   *  Optional: when omitted the user picks on Ayrshare's side. */
  provider?: AyrshareProvider;
};
export type ConnectLinkResult = { connectUrl: string };

export const socialApi = {
  accounts: () => api.get<AccountsResponse>("/marketing/social/accounts"),
  connectLink: (body: ConnectLinkInput = {}) =>
    api.post<ConnectLinkResult>("/marketing/social/connect-link", body),
  disconnect: (provider: AyrshareProvider) =>
    api.post<void>(`/marketing/social/accounts/${provider}/disconnect`),
};
