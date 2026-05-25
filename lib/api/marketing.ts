// Marketing module — typed API surface. Endpoints: ACTION_LIST §11.8.
import { api } from "./client";

export type Tone = "success" | "warning" | "danger" | "neutral" | "primary";
export type Kpi = { value: string | number; delta: string; tone: Tone };
export type MarketingSummary = {
  socialReach: Kpi;
  postEngagement: Kpi;
  newLeads: Kpi;
  emailOpenRate: Kpi;
  adSpend: Kpi;
};

export type MarketingPost = {
  id: string;
  title: string | null;
  platform: string | null;
  platforms: string[];
  content: string | null;
  mediaIds: string[];
  scheduledAt: string | null;
  status: string;
  publishedAt: string | null;
};

export type Campaign = {
  id: string;
  name: string;
  type: string;
  status: string;
  audienceSize: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
  scheduledAt: string | null;
};

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: string | null;
  stage: string;
  value: number | null;
  notes: string | null;
  createdAt: string;
};

export type FunnelStage = { stage: string; count: number };
export type Funnel = { stages: FunnelStage[]; conversionRate: number };

export type Connection = { id: string; platform: string; handle: string; status: string; connectedAt: string };

export type CreatePostInput = { title?: string; content?: string; platforms?: string[]; mediaIds?: string[]; scheduledAt?: string };
export type CreateCampaignInput = { name: string; type: string; content?: string; audienceSize?: number; scheduledAt?: string };
export type CreateLeadInput = { name: string; email?: string; phone?: string; source?: string };
export type UpdateLeadInput = { stage?: string; name?: string; value?: number; notes?: string };

export const marketingApi = {
  summary: () => api.get<MarketingSummary>("/marketing/summary"),

  posts: (qs = "") => api.get<MarketingPost[]>(`/marketing/posts${qs ? `?${qs}` : ""}`),
  createPost: (body: CreatePostInput) => api.post<MarketingPost>("/marketing/posts", body),
  updatePost: (id: string, body: CreatePostInput) => api.patch<MarketingPost>(`/marketing/posts/${id}`, body),
  deletePost: (id: string) => api.del<void>(`/marketing/posts/${id}`),
  publishPost: (id: string) => api.post<MarketingPost>(`/marketing/posts/${id}/publish`),

  campaigns: (qs = "") => api.get<Campaign[]>(`/marketing/campaigns${qs ? `?${qs}` : ""}`),
  createCampaign: (body: CreateCampaignInput) => api.post<Campaign>("/marketing/campaigns", body),

  funnel: () => api.get<Funnel>("/marketing/leads/funnel"),
  leads: (stage = "") => api.get<Lead[]>(`/marketing/leads${stage ? `?stage=${encodeURIComponent(stage)}` : ""}`),
  createLead: (body: CreateLeadInput) => api.post<Lead>("/marketing/leads", body),
  updateLead: (id: string, body: UpdateLeadInput) => api.patch<Lead>(`/marketing/leads/${id}`, body),

  connections: () => api.get<Connection[]>("/marketing/connections"),
  connect: (platform: string, handle: string) => api.post<Connection>("/marketing/connections", { platform, handle }),
  disconnect: (id: string) => api.del<void>(`/marketing/connections/${id}`),
};
