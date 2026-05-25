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

export type RoleDef = { role: string; label: string; permissions: string[] };

export const staffApi = {
  list: () => api.get<StaffMember[]>("/staff"),
  roles: () => api.get<RoleDef[]>("/staff/roles"),
  invite: (email: string, role: StaffRole) => api.post<StaffMember>("/staff/invite", { email, role }),
  update: (id: string, body: { role?: StaffRole; active?: boolean }) => api.patch<StaffMember>(`/staff/${id}`, body),
  resendInvite: (id: string) => api.post<void>(`/staff/${id}/resend-invite`),
};
