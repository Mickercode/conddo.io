// Settings module — typed API surface. Endpoints: ACTION_LIST §11.11.
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
  primaryColor?: string;
  social?: { instagram?: string; twitter?: string; facebook?: string; linkedin?: string };
  location?: { street?: string; city?: string; state?: string };
};

export const settingsApi = {
  businessProfile: () => api.get<BusinessProfile>("/settings/business-profile"),
  updateBusinessProfile: (body: Record<string, unknown>) => api.put<BusinessProfile>("/settings/business-profile", body),
};
