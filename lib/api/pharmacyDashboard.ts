// Pharmacy "dashboard side" API — for the pharmacist managing what comes in
// from the tenant's customer-facing website. Spec:
// backend/PHARMACY_PUBLIC_API_SPEC.md §12.
//
// Distinct from the internal dispensing log at /api/v1/prescriptions
// (PHARMACY_DEEP_DIVE_SPEC.md). This module covers customer-uploaded
// prescriptions awaiting pharmacist review, telepharmacy consultations,
// per-customer health profiles, and manual (walk-in) order entry.
//
// URL choice: BE spec lists `/dashboard/{slug}/pharmacy/*` but the JWT
// already carries the tenant — we drop the slug and call
// `/api/v1/pharmacy/*` on the FE. BE can rewrite the path; the wire shapes
// below are what matters.

import { api } from "./client";

// ---------- Customer-uploaded prescription review queue ----------

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export type CustomerPrescription = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  fileUrl: string;            // MinIO/Cloudinary URL of the uploaded Rx
  patientName: string;
  prescriberName: string;
  notes?: string | null;
  status: ReviewStatus;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  reviewedByName?: string | null;
  submittedAt: string;
  orderId?: string | null;
};

export type ReviewPrescriptionInput = {
  status: "APPROVED" | "REJECTED";
  reviewNote?: string;
};

// ---------- Telepharmacy consultations ----------

export type ConsultationStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type Consultation = {
  id: string;
  customerId?: string | null;     // null for anonymous walk-in requests
  customerName: string;
  whatsappNumber: string;
  topic: string;
  preferredTime?: string | null;   // ISO datetime
  status: ConsultationStatus;
  pharmacistNote?: string | null;
  createdAt: string;
  completedAt?: string | null;
};

export type ConsultationStatusUpdate = {
  status: ConsultationStatus;
  pharmacistNote?: string;
};

// ---------- Health profile (per-customer) ----------

export type HealthProfile = {
  customerId: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  bloodGroup?: string | null;
  notes?: string | null;
  updatedAt?: string | null;
};

export type HealthProfileInput = {
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  bloodGroup?: string | null;
  notes?: string | null;
};

// ---------- API surface ----------

export const pharmacyDashboardApi = {
  // Customer Rx review queue
  customerPrescriptions: (status?: ReviewStatus) =>
    api.get<CustomerPrescription[]>(
      `/pharmacy/customer-prescriptions${status ? `?status=${status}` : ""}`,
    ),
  customerPrescription: (id: string) =>
    api.get<CustomerPrescription>(`/pharmacy/customer-prescriptions/${id}`),
  reviewCustomerPrescription: (id: string, body: ReviewPrescriptionInput) =>
    api.patch<CustomerPrescription>(
      `/pharmacy/customer-prescriptions/${id}/review`,
      body as unknown as Record<string, unknown>,
    ),

  // Consultations
  consultations: (status?: ConsultationStatus) =>
    api.get<Consultation[]>(
      `/pharmacy/consultations${status ? `?status=${status}` : ""}`,
    ),
  updateConsultation: (id: string, body: ConsultationStatusUpdate) =>
    api.patch<Consultation>(
      `/pharmacy/consultations/${id}/status`,
      body as unknown as Record<string, unknown>,
    ),

  // Health profile (per-customer)
  healthProfile: (customerId: string) =>
    api.get<HealthProfile>(`/pharmacy/customers/${customerId}/health-profile`),
  updateHealthProfile: (customerId: string, body: HealthProfileInput) =>
    api.put<HealthProfile>(
      `/pharmacy/customers/${customerId}/health-profile`,
      body as unknown as Record<string, unknown>,
    ),
};
