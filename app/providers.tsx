"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastProvider } from "@/components/ui/Toast";

// All client-side context providers live here so the root layout can stay a
// pure Server Component. We do the Google client-id gating at the top: if the
// env var is unset (e.g. a fresh local clone) we just render children without
// the Google provider — the "Continue with Google" buttons hide themselves
// the same way (see lib/api/google.ts → hasGoogleClient()).
//
// The previous RouteTransition full-screen loader has been removed — Next.js
// App Router already prefetches and renders new routes synchronously enough
// that the manual overlay was holding the user back rather than smoothing
// the transition, and it clashed visually with the cinematic dark surface
// across marketing routes.
export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = <ToastProvider>{children}</ToastProvider>;

  if (!googleClientId) return content;
  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
}
