// Staff module — typed API surface. Endpoint: ACTION_LIST §11.10.
import { api } from "./client";

export type StaffRole = "TENANT_ADMIN" | "STAFF";
export type StaffStatus = "active" | "invited" | "inactive";
export type StaffMember = {
  id: string;
  name: string | null;
  email: string;
  role: StaffRole;
  status: StaffStatus;
  lastActive: string | null;
};

export const staffApi = {
  list: () => api.get<StaffMember[]>("/staff"),
};
