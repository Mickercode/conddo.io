// Account/auth API — signup, login, logout, and the current session (/me).
// Auth endpoints live at the root (/auth/*); signup is /api/v1/tenants.

import { api, authApi } from "./client";
import { setAccessToken, clearAccessToken } from "./auth";

export type SignupInput = {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  verticalId?: string;
};
export type Tenant = {
  id: string;
  name: string;
  slug: string;
  verticalId: string | null;
  planId: string | null;
  status: string;
  createdAt: string;
};

export type LoginInput = { email: string; password: string; tenantSlug: string };
export type LoginResult = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: string;
  role: string;
};

export type Me = {
  user: { id: string; fullName: string | null; email: string; role: string; initials: string };
  tenant: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
    customDomain: string | null;
    verticalId: string;
    planId: string | null;
    status: string;
  };
};

/** Create a tenant + its first admin. Does NOT log in (no token returned). */
export async function signup(input: SignupInput): Promise<Tenant> {
  const { data } = await api.post<Tenant>("/tenants", input);
  return data;
}

/** Authenticate; stores the access token for subsequent requests. */
export async function login(input: LoginInput): Promise<LoginResult> {
  const { data } = await authApi.post<LoginResult>("/auth/login", input);
  setAccessToken(data.accessToken);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await authApi.post("/auth/logout");
  } catch {
    /* best-effort */
  }
  clearAccessToken();
}

export async function getMe(): Promise<Me> {
  const { data } = await api.get<Me>("/me");
  return data;
}

/** `/me` as a Result, for use with `useApiQuery`. */
export const meQuery = () => api.get<Me>("/me");

/** Turn a business name into a URL-safe subdomain slug. */
export const slugify = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
