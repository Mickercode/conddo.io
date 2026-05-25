// Bookings module — typed API surface. Endpoints: ACTION_LIST §11.5.
import { api } from "./client";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type DayHours = { start: string; end: string; open: boolean };
export type Availability = {
  workingHours: Record<DayKey, DayHours>;
  slotDurationMinutes: number;
  bufferMinutes: number;
};

export type BookingEvent = {
  id: string;
  customer: string;
  service: string;
  start: string;
  end?: string;
  mode?: string;
  status?: string;
  when?: string; // human label used by "upcoming" cards
};

export type Performance = { bookingsThisWeek: number; revenueProjected: number };

export const bookingsApi = {
  range: (from: string, to: string) => api.get<BookingEvent[]>(`/bookings?from=${from}&to=${to}`),
  today: () => api.get<BookingEvent[]>(`/bookings?date=today`),
  upcoming: () => api.get<BookingEvent[]>("/bookings/upcoming"),
  availability: () => api.get<Availability>("/bookings/availability"),
  performance: (range = "week") => api.get<Performance>(`/bookings/performance?range=${range}`),
};
