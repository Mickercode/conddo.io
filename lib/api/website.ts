// Website module — typed API surface. Endpoint: ACTION_LIST §11.2.
import { api } from "./client";

export type WebsiteStatus = {
  subdomain?: string;
  status?: string;
  visitsToday?: number;
  enquiries?: number;
};

export const websiteApi = {
  status: () => api.get<WebsiteStatus>("/website"),
};
