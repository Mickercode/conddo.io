// Global search — typed API surface. Endpoint: ACTION_LIST §11.12.
import { api } from "./client";

export type SearchHit = { id: string; label: string; sublabel: string | null };
export type SearchResults = { customers: SearchHit[]; orders: SearchHit[]; bookings: SearchHit[] };

export const searchApi = {
  query: (q: string) => api.get<SearchResults>(`/search?q=${encodeURIComponent(q)}`),
};
