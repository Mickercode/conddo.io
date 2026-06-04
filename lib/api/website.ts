// Website module — typed API surface. Endpoint: ACTION_LIST §11.2.
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

export const websiteApi = {
  status: () => api.get<WebsiteStatus>("/website"),
  requestChange: (body: WebsiteChangeRequestInput) =>
    api.post<WebsiteChangeRequest>("/website/change-requests", body),
};
