// Analytics module — typed API surface. Endpoint: ACTION_LIST §11.9.
import { api } from "./client";

export type Overview = {
  revenue: number;
  orders: number;
  newCustomers: number;
  avgOrderValue: number;
};

export const analyticsApi = {
  overview: (range = "30d") => api.get<Overview>(`/analytics/overview?range=${range}`),
};
