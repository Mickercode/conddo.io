// Website module — typed API surface. Endpoint: ACTION_LIST §11.2.
// Public site key + integration metadata spec: backend/WEBSITE_INTEGRATION_SPEC.md.
import { api } from "./client";

export type WebsiteStatus = {
  subdomain?: string;
  status?: string;
  visitsToday?: number;
  enquiries?: number;
};

export type WebsiteChangeRequestInput = { area?: string; details: string };
export type WebsiteChangeRequest = {
  id: string;
  area: string | null;
  details: string;
  status: string;
  createdAt: string;
};

// Public site registration — one row per tenant in `tenant_sites`. The
// apiKey is the public-safe X-Conddo-Site-Key the dev embeds in the
// tenant's site frontend. `siteType` tells us if it's a custom build or a
// template; `qaApproved` gates whether the site can serve traffic.
export type TenantSite = {
  id: string;
  tenantId: string;
  subdomain: string | null;
  customDomain: string | null;
  hostingProvider: "conddo" | "vercel" | "9stacks" | null;
  siteType: "custom_built" | "template" | null;
  apiKey: string;                  // full key, only returned to TENANT_ADMIN
  apiKeyMasked: string;            // e.g. "sk_live_••••••••a3f2" — always present
  isActive: boolean;
  qaApproved: boolean;
  qaApprovedAt: string | null;
  submittedUrl: string | null;     // URL the developer submitted for QA
  createdAt: string;
};

export const websiteApi = {
  status: () => api.get<WebsiteStatus>("/website"),
  requestChange: (body: WebsiteChangeRequestInput) =>
    api.post<WebsiteChangeRequest>("/website/change-requests", body),

  // GET /website/site — the tenant_sites row for the current tenant. Returns
  // the full apiKey (TENANT_ADMIN only); STAFF gets a 403. 404 if the tenant
  // has no site row yet (haven't been registered by Studio).
  site: () => api.get<TenantSite>("/website/site"),

  // POST /website/site/regenerate-key — rotate the API key. Invalidates the
  // old one immediately, returns the new one. TENANT_ADMIN only.
  regenerateSiteKey: () => api.post<TenantSite>("/website/site/regenerate-key"),
};
