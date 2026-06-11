// Pharmacy Drug Programs — Roadmap Beta 3.
//
// Structured care programs the pharmacist bundles: products, reminders,
// follow-ups, and consultations into a subscription package. Patients enrol
// from the website or are manually enrolled; Conddo charges monthly via
// Routepay recurring.
//
// Expected BE paths (normalised to /api/v1/pharmacy/programs/...):
//   GET   /api/v1/pharmacy/programs
//   POST  /api/v1/pharmacy/programs
//   PUT   /api/v1/pharmacy/programs/{id}
//   PATCH /api/v1/pharmacy/programs/{id}/publish
//   GET   /api/v1/pharmacy/programs/{id}/enrollments
//   POST  /api/v1/pharmacy/programs/{id}/enroll
//
// Tenant from JWT.

import { api } from "./client";

export type ProgramFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY";

export type ProgramItem = {
  id?: string;
  productId: string;
  productName?: string | null;  // server-joined for display
  quantity: number;
  frequency?: ProgramFrequency;
};

export type Program = {
  id: string;
  name: string;
  description?: string | null;
  /** Free-text condition the program targets — e.g. "Type 2 Diabetes". */
  targetCondition?: string | null;
  /** Months — `null` = ongoing / no end. */
  durationMonths?: number | null;
  monthlyPrice: number;
  isActive: boolean;
  /** True once published to the website (visible to customers). */
  isPublished?: boolean;
  /** Server-derived for the list view. */
  enrollmentsCount?: number;
  items: ProgramItem[];
  createdBy?: { id?: string; name?: string | null } | null;
  createdAt?: string;
};

export type CreateProgramInput = {
  name: string;
  description?: string;
  targetCondition?: string;
  durationMonths?: number | null;
  monthlyPrice: number;
  items: Omit<ProgramItem, "id" | "productName">[];
};

export type UpdateProgramInput = Partial<CreateProgramInput> & {
  isActive?: boolean;
};

export type EnrollmentStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export type ProgramEnrollment = {
  id: string;
  programId: string;
  customer: {
    id: string;
    name?: string | null;
    phone?: string | null;
  };
  status: EnrollmentStatus;
  enrolledAt: string;
  nextBillingAt?: string | null;
  endsAt?: string | null;
};

export type EnrollInput = {
  customerId: string;
  /** Where Paystack should return the customer after the first-month
   *  charge. Defaults BE-side to `${siteOrigin}/pharmacy/programs/{id}`. */
  returnUrl?: string;
};

/** Enrollment goes through Paystack hosted checkout for the first month's
 *  charge; subsequent months auto-bill via the Paystack subscription. The
 *  enrollment row is `PENDING_PAYMENT` until the verify confirms `success`,
 *  then flips to `ACTIVE`. */
export type EnrollResult = {
  enrollment: ProgramEnrollment;
  /** Hosted-checkout URL — FE redirects on this. Absent for ops-side
   *  enrolments that BE already charged separately (rare). */
  authorizationUrl?: string;
  reference?: string;
};

const BASE = "/pharmacy/programs";

export const programsApi = {
  list: () => api.get<Program[]>(BASE),
  get: (id: string) => api.get<Program>(`${BASE}/${id}`),
  create: (body: CreateProgramInput) => api.post<Program>(BASE, body),
  update: (id: string, body: UpdateProgramInput) =>
    api.put<Program>(`${BASE}/${id}`, body),
  publish: (id: string, isPublished: boolean) =>
    api.patch<Program>(`${BASE}/${id}/publish`, { isPublished }),
  enrollments: (id: string) =>
    api.get<ProgramEnrollment[]>(`${BASE}/${id}/enrollments`),
  enroll: (id: string, body: EnrollInput) =>
    api.post<EnrollResult>(`${BASE}/${id}/enroll`, body),
};

/** Add the existing `PENDING_PAYMENT` state to the enrollment status union,
 *  since the FE now treats the post-enroll-before-verify period as its own
 *  status (BE may report it as ACTIVE-with-no-charges-yet — either way,
 *  the FE just needs to display it cleanly). */
export type EnrollmentStatusExtended = EnrollmentStatus | "PENDING_PAYMENT";

export const ENROLLMENT_LABELS: Record<EnrollmentStatus, string> = {
  ACTIVE:    "Active",
  PAUSED:    "Paused",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function enrollmentTone(s: EnrollmentStatus): "success" | "warning" | "neutral" | "danger" {
  switch (s) {
    case "ACTIVE":    return "success";
    case "PAUSED":    return "warning";
    case "COMPLETED": return "neutral";
    case "CANCELLED": return "danger";
  }
}
