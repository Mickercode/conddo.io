// Settings module — typed API surface. Endpoints: ACTION_LIST §11.11.
// Note: business-profile GET returns only the core fields below; branding and
// social-handles are PUT-only (no GET), so those sections don't pre-fill.
import { api } from "./client";

export type BusinessProfile = {
  name: string;
  tagline: string | null;
  description: string | null;
  email: string | null;
  phone: string | null;
  industry: string;
  subdomain: string;
  status: string;
};

export type BusinessProfileInput = {
  name?: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
};
export type BrandingInput = { primaryColor?: string; logoUrl?: string };
export type SocialHandles = { instagram?: string; twitter?: string; facebook?: string; linkedin?: string };
export type LocationInput = { street?: string; city?: string; state?: string; [k: string]: unknown };

export const settingsApi = {
  businessProfile: () => api.get<BusinessProfile>("/settings/business-profile"),
  updateBusinessProfile: (body: BusinessProfileInput) => api.put<BusinessProfile>("/settings/business-profile", body),

  updateBranding: (body: BrandingInput) => api.put<BrandingInput>("/settings/branding", body),
  updateSocialHandles: (body: SocialHandles) => api.put<Record<string, unknown>>("/settings/social-handles", body),

  location: () => api.get<LocationInput>("/settings/location"),
  updateLocation: (body: LocationInput) => api.put<LocationInput>("/settings/location", body),

  businessHours: () => api.get<Record<string, unknown>>("/settings/business-hours"),
  updateBusinessHours: (body: Record<string, unknown>) => api.put<Record<string, unknown>>("/settings/business-hours", body),

  notifications: () => api.get<Record<string, unknown>>("/settings/notifications"),
  updateNotifications: (body: Record<string, unknown>) => api.put<Record<string, unknown>>("/settings/notifications", body),

  deactivate: () => api.post<BusinessProfile>("/settings/danger/deactivate"),
};
