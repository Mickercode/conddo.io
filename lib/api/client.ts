// Typed fetch client for the Conddo backend. Handles the standard ApiResponse
// envelope, the /api/v1 prefix, the Bearer token, and error normalization.
// Endpoints are documented in backend/ACTION_LIST.md §11.

import { getAccessToken } from "./auth";
import type { ApiResponse, Result } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

/** A normalized API error. `code === "api_not_configured"` means NEXT_PUBLIC_API_URL
 *  is unset — screens treat that as "no data yet" rather than a hard error. */
export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;
  constructor(code: string, message: string, status = 0, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export const isNotConfigured = (e: unknown): boolean =>
  e instanceof ApiError && e.code === "api_not_configured";

/** A 5xx server error. During backend build-out an unbuilt endpoint returns 500,
 *  so screens treat this as "not ready yet" (empty state) rather than a hard error. */
export const isServerError = (e: unknown): boolean =>
  e instanceof ApiError && e.status >= 500;

type Body = Record<string, unknown> | undefined;
type Opts = { versioned?: boolean };

async function request<T>(method: string, path: string, body?: Body, opts: Opts = {}): Promise<Result<T>> {
  if (!BASE) {
    throw new ApiError("api_not_configured", "Backend API URL is not configured.");
  }

  const prefix = opts.versioned === false ? "" : "/api/v1";
  const token = getAccessToken();
  let res: Response;
  try {
    res = await fetch(`${BASE}${prefix}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
  } catch {
    throw new ApiError("network_error", "Could not reach the server. Check your connection.");
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    /* non-JSON response */
  }

  if (!res.ok || !json || json.success === false) {
    throw new ApiError(
      json?.error?.code ?? "request_failed",
      json?.error?.message ?? res.statusText ?? "Request failed.",
      res.status,
      json?.error?.details,
    );
  }

  return { data: json.data, meta: json.meta };
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: Body) => request<T>("POST", path, body),
  put: <T>(path: string, body?: Body) => request<T>("PUT", path, body),
  patch: <T>(path: string, body?: Body) => request<T>("PATCH", path, body),
  del: <T>(path: string) => request<T>("DELETE", path),
};

/** For endpoints that live outside the /api/v1 prefix (auth). */
export const authApi = {
  post: <T>(path: string, body?: Body) => request<T>("POST", path, body, { versioned: false }),
};
