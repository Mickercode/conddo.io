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
  customerId?: string | null;
  customer: string;
  service: string;
  start: string;
  end?: string | null;
  mode?: string | null;
  status?: string | null;
  amount?: number | null;
  notes?: string | null;
  when?: string; // human label used by "upcoming" cards
};

export type Performance = { bookingsThisWeek: number; revenueProjected: number };

// The shareable self-book link (GET/POST /bookings/link).
export type BookingLink = { slug: string; enabled: boolean; url: string };

// Write payloads (backend CreateBookingRequest / AvailabilityRequest, §11.5).
export type CreateBookingInput = {
  customerId?: string;
  customerName?: string;
  service?: string;
  start: string; // ISO datetime (required)
  end?: string;
  mode?: string;
  amount?: number;
  notes?: string;
};
export type AvailabilityInput = {
  workingHours?: Partial<Record<DayKey, DayHours>>;
  slotDurationMinutes?: number;
  bufferMinutes?: number;
};

export const bookingsApi = {
  range: (from: string, to: string) => api.get<BookingEvent[]>(`/bookings?from=${from}&to=${to}`),
  today: () => api.get<BookingEvent[]>(`/bookings?date=today`),
  upcoming: () => api.get<BookingEvent[]>("/bookings/upcoming"),
  availability: () => api.get<Availability>("/bookings/availability"),
  performance: (range = "week") => api.get<Performance>(`/bookings/performance?range=${range}`),
  link: () => api.get<BookingLink>("/bookings/link"),

  create: (body: CreateBookingInput) => api.post<BookingEvent>("/bookings", body),
  update: (id: string, body: Partial<CreateBookingInput> & { status?: string }) =>
    api.patch<BookingEvent>(`/bookings/${id}`, body),
  remove: (id: string) => api.del<void>(`/bookings/${id}`),
  updateAvailability: (body: AvailabilityInput) => api.put<Availability>("/bookings/availability", body),
  regenerateLink: () => api.post<BookingLink>("/bookings/link"),
};
