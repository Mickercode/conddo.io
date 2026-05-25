// Access-token store. The token is issued by /auth/login (backend ACTION_LIST §7.1)
// and attached as a Bearer header by the API client. Kept in localStorage for now;
// can move to an httpOnly-cookie + refresh flow when the login screen is wired.

const TOKEN_KEY = "conddo_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}
