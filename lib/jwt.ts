// Client-side JWT decode (payload only — NOT verification). Used to read the
// access token's claims (activeModules, vertical, plan, role) for the UI.
// Trust decisions are enforced server-side; this is for rendering only.

export type JwtClaims = {
  sub?: string;
  tenantId?: string;
  role?: string;
  vertical?: string;
  plan?: string;
  activeModules?: string[];
  iat?: number;
  exp?: number;
};

export function decodeJwt(token: string | null): JwtClaims | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}
