// Google Sign-in client wrappers — POST /auth/google + /auth/register/start-google.
// Backend contract: backend/ACTION_LIST.md §1a.
//
// The frontend obtains a Google ID token via @react-oauth/google's
// `useGoogleLogin` (popup, response_type='id_token'), then sends it here.
// The backend verifies it against Google's JWKS, maps to / creates a user, and
// returns either the same LoginResult as /auth/login or the same
// RegisterStartResult as /auth/register/start.

import { authApi } from "./client";
import { setAccessToken } from "./auth";
import type { LoginResult, RegisterStartResult } from "./account";

/** True when NEXT_PUBLIC_GOOGLE_CLIENT_ID is set. Components hide the Google
 *  button when this is false instead of rendering a button that can't work. */
export function hasGoogleClient(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
}

/** Existing-user sign-in. Returns the same LoginResult /auth/login does and
 *  stashes the access token. The backend may "link" the account on first
 *  Google sign-in (sees the user via email, then writes google_sub). */
export async function loginWithGoogle(input: { idToken: string; tenantSlug: string }): Promise<LoginResult> {
  const { data } = await authApi.post<LoginResult>("/auth/google", input);
  setAccessToken(data.accessToken);
  return data;
}

/** New-user signup. Starts the same registration flow /auth/register/start does
 *  (returns a registrationId; the user still verifies their phone via OTP next). */
export async function registerStartWithGoogle(input: { idToken: string; phone: string }): Promise<RegisterStartResult> {
  const { data } = await authApi.post<RegisterStartResult>("/auth/register/start-google", input);
  return data;
}
