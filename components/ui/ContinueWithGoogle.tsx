"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { hasGoogleClient } from "@/lib/api/google";

/**
 * The "Continue with Google" button. Returns null when NEXT_PUBLIC_GOOGLE_CLIENT_ID
 * is unset (so the auth pages don't render a dead button on a fresh local clone).
 *
 * Renders Google's branded button — accessible, recognised, and matches what
 * users expect on SaaS sign-in pages. The parent gets the raw ID token via
 * `onCredential` and forwards it to /auth/google or /auth/register/start-google.
 *
 * The GIS button width must be a numeric pixel string (GIS rejects "100%").
 * We size to 360 — closely tracks the auth-card width (max-w-md ≈ 448px minus
 * padding) and clips cleanly inside it on mobile.
 */
export function ContinueWithGoogle({
  onCredential,
  onError,
  disabled = false,
}: {
  onCredential: (idToken: string) => void | Promise<void>;
  onError?: (message: string) => void;
  disabled?: boolean;
}) {
  if (!hasGoogleClient()) return null;

  if (disabled) {
    return (
      <div className="flex h-11 w-full items-center justify-center rounded-md border border-neutral-strong bg-neutral-surface2 text-[14px] text-content-muted">
        Enter your workspace first
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center">
      <GoogleLogin
        onSuccess={(resp: CredentialResponse) => {
          if (!resp.credential) {
            onError?.("Google didn't return a credential. Please try again.");
            return;
          }
          onCredential(resp.credential);
        }}
        onError={() => onError?.("Google sign-in was cancelled or failed. Please try again.")}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        logo_alignment="center"
        width="360"
      />
    </div>
  );
}
