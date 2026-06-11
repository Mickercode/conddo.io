// Staff module — typed API surface. Endpoint: ACTION_LIST §11.10.
//
// Two-layer role model:
//   - `role` is the platform-level enum (TENANT_ADMIN / STAFF / SUPER_ADMIN).
//     STAFF users carry an additional `staffRole` sub-enum below that
//     determines which work surface they land on and which modules they
//     see in the sidebar.
//   - The Owner ("TENANT_ADMIN") sees everything in the main `/dashboard`
//     experience; everyone else uses the role-scoped `/work/*` tree.

import { api } from "./client";
import type { StaffSubRole } from "./account";

export type { StaffSubRole };

export type StaffStatus = "active" | "invited" | "inactive";

export type StaffMember = {
  id: string;
  name: string | null;
  email: string;
  role: "TENANT_ADMIN" | "STAFF";
  /** Sub-role for STAFF members; null on the owner. */
  staffRole?: StaffSubRole | null;
  status: StaffStatus;
  lastActive: string | null;
};

export type StaffRoleDef = {
  /** Server-canonical key — matches StaffSubRole. */
  key: StaffSubRole;
  /** Display label ("Cashier"). */
  label: string;
  /** One-liner describing what this role does day-to-day. */
  description: string;
  /** Bullet-pointed access summary shown in the invite modal + accept-invite
   *  preview. Plain strings; FE renders as a list. */
  access: string[];
};

export type InviteInput = {
  email: string;
  staffRole: StaffSubRole;
  /** Optional — when present, BE pre-fills the staffer's profile. They can
   *  still change it on accept. */
  fullName?: string;
};

export type UpdateStaffInput = {
  staffRole?: StaffSubRole;
  active?: boolean;
};

/** Curated FE-side catalogue. BE returns the canonical version via
 *  `staffApi.roles()` once it's wired; until then this is the source of
 *  truth for both the invite modal and the accept-invite preview. */
export const STAFF_ROLE_CATALOGUE: StaffRoleDef[] = [
  {
    key: "MANAGER",
    label: "Manager",
    description: "A second-in-command. Can do almost everything except billing and staff management.",
    access: [
      "All dashboard pages",
      "Create / edit / void orders, bookings, products",
      "Approve discounts, run reconciliations",
      "View analytics and payments",
      "Cannot change billing or invite new staff",
    ],
  },
  {
    key: "PHARMACIST",
    label: "Pharmacist",
    description: "Clinical access — prescriptions, consultations, patient EMRs, follow-ups.",
    access: [
      "Review prescriptions, dispense, mark complete",
      "Manage consultations and follow-ups",
      "Read and write patient Electronic Medical Records",
      "Access full customer profiles for clinical context",
      "Cannot change inventory pricing or run POS",
    ],
  },
  {
    key: "CASHIER",
    label: "Cashier",
    description: "Walk-in sales only — open shifts, run sales, take payments, close shifts.",
    access: [
      "Open and close shifts with cash reconciliation",
      "Run POS sales — add items, take payment, print receipts",
      "Attach customers to sales for cashback",
      "View customer phone numbers and names (read-only)",
      "Cannot edit inventory, see revenue, or void completed sales",
    ],
  },
  {
    key: "STOCK_MANAGER",
    label: "Stock Manager",
    description: "Inventory keeper — receive deliveries, run counts, manage SKUs.",
    access: [
      "Add and edit products, categories, batch numbers",
      "Record restocks and run reconciliations",
      "Bulk-upload CSVs to update stock levels",
      "View movement log for audit",
      "Cannot see customer data, revenue, or take payments",
    ],
  },
  {
    key: "BOOKKEEPER",
    label: "Bookkeeper",
    description: "Read-only view of orders, payments, and analytics for accounting.",
    access: [
      "View all orders and payments (read-only)",
      "Read full analytics — revenue, top products, trends",
      "Export CSVs for accounting software",
      "Cannot edit anything; no clinical or inventory access",
    ],
  },
];

/** Lookup helper. Falls back to a generic "Staff member" def for unknown
 *  keys so older invites issued before a role rename still render gracefully. */
export function roleDefFor(key?: StaffSubRole | null): StaffRoleDef {
  return (
    STAFF_ROLE_CATALOGUE.find((r) => r.key === key) ?? {
      key: "MANAGER",
      label: "Staff member",
      description: "Custom access — your owner set this up for you.",
      access: ["Access defined by your owner."],
    }
  );
}

/** Maps a StaffSubRole to the `/work/...` landing route. Used by the
 *  post-login + post-accept-invite routing logic in one place so it stays
 *  consistent across both flows. */
export function landingPathFor(role: StaffSubRole | null | undefined): string {
  switch (role) {
    case "CASHIER":       return "/work/sales";
    case "STOCK_MANAGER": return "/work/stock";
    case "PHARMACIST":    return "/work/clinical";
    case "BOOKKEEPER":    return "/work/desk";
    case "MANAGER":       return "/work";       // Manager router picks
    default:              return "/work";
  }
}

export const staffApi = {
  list: () => api.get<StaffMember[]>("/staff"),
  roles: () => api.get<StaffRoleDef[]>("/staff/roles"),
  /** Send an invite with email + sub-role. BE issues a one-time
   *  acceptInviteToken and emails the link to /accept-invite?token=. */
  invite: (body: InviteInput) => api.post<StaffMember>("/staff/invite", body),
  update: (id: string, body: UpdateStaffInput) =>
    api.patch<StaffMember>(`/staff/${id}`, body),
  resendInvite: (id: string) => api.post<void>(`/staff/${id}/resend-invite`),
  deactivate: (id: string) =>
    api.patch<StaffMember>(`/staff/${id}`, { active: false }),
};

/** Legacy alias — earlier code used `StaffRole` for the top-level enum. New
 *  code should use the explicit literal type on `StaffMember.role` directly. */
export type StaffRole = StaffMember["role"];
