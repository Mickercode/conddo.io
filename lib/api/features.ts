// Tenant feature flags + interest tracking — Roadmap spec.
//
// Each Beta or Coming Soon feature is keyed by a slug (see ROADMAP_FEATURES
// below). The dashboard exposes one of two CTAs depending on `status`:
//
//   coming_soon → "Notify me when it's ready"
//     POST /api/v1/dashboard/{slug}/feature-interest    { featureKey }
//
//   beta        → "Request Beta access"
//     POST /api/v1/dashboard/{slug}/beta-access-request { featureKey }
//
// Conddo ops reviews beta requests and flips the per-tenant flag on approval.
// "Notify me" simply registers demand — no approval needed.

import type { LucideIcon } from "lucide-react";
import {
  Sparkles, Activity, ListChecks, ClipboardPlus, Smartphone, Building2,
  Repeat, ScanLine, Stethoscope,
} from "lucide-react";
import { api } from "./client";

export type FeatureStatus = "live" | "beta" | "coming_soon";

export type FeatureFlag = {
  featureKey: string;
  status: FeatureStatus;
  enabled: boolean;
  grantedAt?: string | null;
};

export type FeatureCatalogueEntry = {
  key: string;
  name: string;
  status: FeatureStatus;
  description: string;
  icon: LucideIcon;
  /** Free-form group label so the /features page can section them. */
  area: "Loyalty & retention" | "Clinical" | "Operations" | "Mobile & platform";
};

/** Canonical pharmacy roadmap from `backend/conddo-pharmacy-roadmap.md`.
 *  Keys MUST match the BE feature-flag table values exactly. */
export const ROADMAP_FEATURES: FeatureCatalogueEntry[] = [
  {
    key: "cashback_loyalty",
    name: "Cashback Loyalty",
    status: "beta",
    description: "Customers earn a configurable cashback percentage on every order. Apply at checkout as a discount on future visits.",
    icon: Sparkles,
    area: "Loyalty & retention",
  },
  {
    key: "followup_workflow",
    name: "Follow-up Workflow",
    status: "beta",
    description: "Schedule a clinical follow-up after dispensing. Conddo reminds you when it's due, you record the outcome on the patient's record.",
    icon: ListChecks,
    area: "Clinical",
  },
  {
    key: "drug_programs",
    name: "Drug Programs",
    status: "beta",
    description: "Bundle products, reminders, and monthly consultations into a structured care program patients can subscribe to.",
    icon: ClipboardPlus,
    area: "Clinical",
  },
  {
    key: "emr_basic",
    name: "Electronic Medical Records",
    status: "beta",
    description: "Structured patient records — diagnoses, full dispensing history, allergies, vaccinations, clinical notes, lab document uploads.",
    icon: Activity,
    area: "Clinical",
  },
  {
    key: "offline_mobile",
    name: "Offline Mobile App",
    status: "coming_soon",
    description: "Count stock, record deliveries, and run reconciliations on a mobile device that works without internet. Syncs when you're back online.",
    icon: Smartphone,
    area: "Mobile & platform",
  },
  {
    key: "multi_store",
    name: "Multi-Store Management",
    status: "coming_soon",
    description: "Manage multiple pharmacy branches from one account — separate stock, per-branch staff, consolidated dashboard.",
    icon: Building2,
    area: "Operations",
  },
  {
    key: "customer_retainer",
    name: "Customer Retainer",
    status: "coming_soon",
    description: "Chronic patients subscribe to receive their medications automatically every month, billed via Routepay recurring.",
    icon: Repeat,
    area: "Loyalty & retention",
  },
  {
    key: "barcode_scan",
    name: "Barcode Scanning (Web)",
    status: "coming_soon",
    description: "Scan drug packaging with the device camera to auto-fill product details from a pharmaceutical barcode database.",
    icon: ScanLine,
    area: "Operations",
  },
  {
    key: "emr_full",
    name: "Full EMR with Compliance",
    status: "coming_soon",
    description: "Beyond Basic EMR — Nigerian healthcare-data compliance, inter-pharmacy record sharing (with consent), NHIA integration.",
    icon: Stethoscope,
    area: "Clinical",
  },
];

const path = (slug: string, rest: string) =>
  `/dashboard/${encodeURIComponent(slug)}${rest}`;

export const featuresApi = {
  /** Register that this tenant wants to be notified when a Coming Soon
   *  feature ships. The BE deduplicates per (tenant, featureKey). */
  notifyInterest: (slug: string, featureKey: string) =>
    api.post<{ success: true; message?: string }>(
      path(slug, "/feature-interest"),
      { featureKey },
    ),

  /** Request Beta access — Conddo ops reviews these manually. */
  requestBetaAccess: (slug: string, featureKey: string) =>
    api.post<{ success: true; message?: string }>(
      path(slug, "/beta-access-request"),
      { featureKey },
    ),
};
