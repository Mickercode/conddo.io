// Bookings module — typed API surface. Endpoints: ACTION_LIST §11.5.
import { api } from "./client";

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type DayHours = { start: string; end: string; open: boolean };
export type Availability = {
  workingHours: Record<DayKey, DayHours>;
  slotDurationMinutes: number;
  bufferMinutes: number;
};

/** Session types for the music-studio vertical (V22 migration, see
 *  backend/MUSIC_STUDIO_SPEC.md). The BE accepts any string here but
 *  these are the canonical values that drive UI grouping + chip colours. */
export type SessionType =
  | "RECORDING" | "MIXING" | "MASTERING" | "PODCAST"
  | "REHEARSAL" | "LESSON" | "OTHER"
  | (string & {});

/** Deposit lifecycle for a booking — drives the "send deposit link" CTA
 *  and the deposit-paid chip on the session card. NONE on every legacy
 *  booking (so the FE renders the pre-MS-2 shape unchanged). */
export type DepositStatus = "NONE" | "PENDING_DEPOSIT" | "DEPOSIT_PAID" | "REFUNDED";

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
  // MS-2 — music-studio extensions; null on legacy bookings.
  resourceId?: string | null;
  sessionType?: SessionType | null;
  depositAmountKobo?: number | null;
  depositStatus?: DepositStatus | null;
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
  // MS-2 fields — optional. Set when scheduling on a music-studio tenant.
  resourceId?: string;
  sessionType?: SessionType;
};

/** POST /bookings/init-with-deposit — music-studio's killer flow. Reserves
 *  the room, returns a RoutePay hosted-checkout URL the customer pays the
 *  deposit through. Booking stays in PENDING_DEPOSIT until the webhook
 *  callback flips it to DEPOSIT_PAID. */
export type InitBookingWithDepositInput = {
  customerId?: string;
  customerName?: string;
  customerEmail: string;         // required — RoutePay needs an email
  resourceId: string;
  sessionType?: SessionType;
  start: string;                 // ISO
  end: string;                    // ISO
  service?: string;
  amount?: number;
  depositAmountKobo: number;     // > 0
  returnUrl?: string;
  notes?: string;
};

export type InitBookingWithDepositResult = {
  booking: BookingEvent;
  checkoutUrl: string;            // RoutePay hosted page
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

  /** Music-studio: create a booking + open a deposit checkout. The booking
   *  lands in PENDING_DEPOSIT; flips to DEPOSIT_PAID when RoutePay calls back. */
  initWithDeposit: (body: InitBookingWithDepositInput) =>
    api.post<InitBookingWithDepositResult>("/bookings/init-with-deposit", body),
};
