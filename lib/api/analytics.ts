// Analytics module — typed API surface. Endpoints: ACTION_LIST §11.9.
//
// Top-level shapes the backend's AnalyticsController returns. All endpoints
// accept an optional `range` (default "30d") and where it applies a
// `granularity` (BE picks a sensible default — usually "daily" for 30d,
// "weekly" for longer ranges).
import { api } from "./client";

export type Overview = {
  revenue: number;
  orders: number;
  newCustomers: number;
  avgOrderValue: number;
};

/** Per-day (or per-week) point on a time-series. BE serialises `date` as a
 *  yyyy-MM-dd LocalDate, value as a number. */
export type SeriesPoint = { date: string; value: number };

/** Customer cohort breakdown — totals + the series for the period. */
export type CustomersAnalytics = {
  newCustomers: number;
  returningCustomers: number;
  total: number;
  series: SeriesPoint[];
};

/** Single entry on a "top N" leaderboard (top services, top products, etc).
 *  The `value` axis is metric-dependent — count for "services"/"products",
 *  revenue for "revenue", session-count for "music-rooms", etc. */
export type TopEntry = { label: string; value: number };

/** Site traffic envelope. Placeholder today (BE returns zeros until the
 *  ingestion path is in production) — FE still consumes the shape so it
 *  lights up the moment BE plugs in real numbers. */
export type Traffic = {
  visits: number;
  enquiries: number;
  conversionRate: number;
};

/** Convenience to build a `?range=…&granularity=…` query string. */
function rangeQs(range?: string, granularity?: string): string {
  const qs = new URLSearchParams();
  if (range) qs.set("range", range);
  if (granularity) qs.set("granularity", granularity);
  const tail = qs.toString();
  return tail ? `?${tail}` : "";
}

export const analyticsApi = {
  overview: (range = "30d") => api.get<Overview>(`/analytics/overview?range=${encodeURIComponent(range)}`),
  /** Revenue series — yyyy-MM-dd × ₦. */
  revenue: (range = "30d", granularity?: string) =>
    api.get<SeriesPoint[]>(`/analytics/revenue${rangeQs(range, granularity)}`),
  /** Orders count series. */
  orders: (range = "30d", granularity?: string) =>
    api.get<SeriesPoint[]>(`/analytics/orders${rangeQs(range, granularity)}`),
  /** Customer cohort + series. */
  customers: (range = "30d", granularity?: string) =>
    api.get<CustomersAnalytics>(`/analytics/customers${rangeQs(range, granularity)}`),
  /** Top-N leaderboard. `metric` is "services" by default (BE accepts
   *  "services" | "products" | "categories" depending on vertical). */
  top: (metric: string = "services") =>
    api.get<TopEntry[]>(`/analytics/top?metric=${encodeURIComponent(metric)}`),
  /** Site traffic + conversion rate (placeholder values until ingestion is
   *  live). */
  traffic: (range = "30d") =>
    api.get<Traffic>(`/analytics/traffic${rangeQs(range)}`),
};
