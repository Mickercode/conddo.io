// Pharmacy Basic EMR — Roadmap Beta 4.
//
// Structured electronic medical record per patient: demographics,
// allergies, chronic conditions, vaccinations, clinical notes (immutable),
// and document uploads (lab results, prescriptions, imaging).
//
// Expected BE paths (normalised to /api/v1/pharmacy/emr/...):
//   GET    /api/v1/pharmacy/emr/{customerId}
//   POST   /api/v1/pharmacy/emr/{customerId}
//   PUT    /api/v1/pharmacy/emr/{customerId}
//   POST   /api/v1/pharmacy/emr/{customerId}/notes
//   POST   /api/v1/pharmacy/emr/{customerId}/documents (multipart)
//   GET    /api/v1/pharmacy/emr/{customerId}/documents
//
// Tenant from JWT. Auth: PHARMACIST | ADMIN per spec.

import { api, uploadFile } from "./client";

export type BloodGroup =
  | "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";

export type Genotype = "AA" | "AS" | "AC" | "SS" | "SC" | "CC";

export type EmrAllergy = {
  /** Substance — e.g. "Penicillin", "Sulfa drugs", "Peanuts". */
  substance: string;
  /** "Mild" | "Moderate" | "Severe" | "Life-threatening". */
  severity?: string;
  reaction?: string;
  notedAt?: string;
};

export type EmrCondition = {
  name: string;
  diagnosedAt?: string;
  /** "Active" | "Resolved" | "In remission". */
  status?: string;
  notes?: string;
};

export type EmrImmunization = {
  vaccine: string;
  administeredAt: string;
  doseNumber?: number;
  manufacturer?: string;
};

export type EMR = {
  customerId: string;
  bloodGroup?: BloodGroup | null;
  genotype?: Genotype | null;
  heightCm?: number | null;
  weightKg?: number | null;
  allergies: EmrAllergy[];
  chronicConditions: EmrCondition[];
  immunizations: EmrImmunization[];
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateEmrInput = Partial<Omit<EMR, "customerId" | "createdAt" | "updatedAt">>;

export type EmrNoteType = "CLINICAL" | "ALLERGY" | "COUNSELLING" | "REFERRAL";

export type EmrNote = {
  id: string;
  note: string;
  noteType: EmrNoteType;
  createdBy?: { id?: string; name?: string | null } | null;
  createdAt: string;
};

export type CreateNoteInput = {
  note: string;
  noteType: EmrNoteType;
};

export type EmrDocumentType =
  | "LAB_RESULT"
  | "PRESCRIPTION"
  | "REFERRAL"
  | "IMAGING"
  | "OTHER";

export type EmrDocument = {
  id: string;
  label?: string | null;
  fileUrl: string;
  docType: EmrDocumentType;
  uploadedBy?: { id?: string; name?: string | null } | null;
  uploadedAt: string;
};

const base = (customerId: string) => `/pharmacy/emr/${customerId}`;

export const emrApi = {
  /** Returns the EMR (and full nested timeline) for a patient. Per spec, the
   *  GET also includes notes inline — the FE renders them as the patient's
   *  clinical history. */
  get: (customerId: string) =>
    api.get<EMR & { notes: EmrNote[] }>(base(customerId)),

  /** Create (first time the patient is seen). Subsequent edits use update(). */
  create: (customerId: string, body: UpdateEmrInput = {}) =>
    api.post<EMR>(base(customerId), body),

  update: (customerId: string, body: UpdateEmrInput) =>
    api.put<EMR>(base(customerId), body),

  addNote: (customerId: string, body: CreateNoteInput) =>
    api.post<EmrNote>(`${base(customerId)}/notes`, body),

  listDocuments: (customerId: string) =>
    api.get<EmrDocument[]>(`${base(customerId)}/documents`),

  uploadDocument: (
    customerId: string,
    file: File,
    docType: EmrDocumentType,
    label?: string,
  ) => {
    const form = new FormData();
    form.append("file", file);
    form.append("docType", docType);
    if (label) form.append("label", label);
    return uploadFile<EmrDocument>(`${base(customerId)}/documents`, form);
  },
};

export const NOTE_TYPE_LABELS: Record<EmrNoteType, string> = {
  CLINICAL:    "Clinical",
  ALLERGY:     "Allergy",
  COUNSELLING: "Counselling",
  REFERRAL:    "Referral",
};

export const DOC_TYPE_LABELS: Record<EmrDocumentType, string> = {
  LAB_RESULT:   "Lab result",
  PRESCRIPTION: "Prescription",
  REFERRAL:     "Referral letter",
  IMAGING:      "Imaging",
  OTHER:        "Other",
};

export function noteTone(t: EmrNoteType): "neutral" | "danger" | "primary" | "warning" {
  switch (t) {
    case "ALLERGY":     return "danger";
    case "REFERRAL":    return "warning";
    case "COUNSELLING": return "primary";
    case "CLINICAL":    return "neutral";
  }
}
