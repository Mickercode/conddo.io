"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import {
  CinematicAuthShell,
  AuthCard,
  fieldLabelCls,
  fieldInputCls,
} from "@/components/auth/CinematicAuthShell";
import { ContinueWithGoogle } from "@/components/ui/ContinueWithGoogle";
import { login, slugify } from "@/lib/api/account";
import { loginWithGoogle, hasGoogleClient } from "@/lib/api/google";
import { clearAccessToken } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Any token in localStorage when the user lands here is by definition stale
  // (they're trying to sign in again). Scrub it — otherwise it gets attached
  // to subsequent /api/v1 calls and 401s anything that depends on /me.
  useEffect(() => { clearAccessToken(); }, []);

  /** Route post-login based on top-level role. STAFF land on /work which
   *  reads me.user.staffRole and forwards to their role-specific landing.
   *  Owners and Conddo support staff keep the full dashboard. */
  function landingFor(role: string): string {
    if (role === "TENANT_ADMIN" || role === "SUPER_ADMIN") return "/dashboard";
    return "/work";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { role } = await login({ email, password, tenantSlug: slugify(workspace) });
      router.push(landingFor(role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Check your details and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function onGoogleCredential(idToken: string) {
    setError(null);
    setSubmitting(true);
    try {
      const { role } = await loginWithGoogle({ idToken, tenantSlug: slugify(workspace) });
      router.push(landingFor(role));
    } catch (err) {
      if (err instanceof ApiError && err.code === "USER_NOT_FOUND") {
        setError("No account in this workspace matches that Google email. Create an account or try a different workspace.");
      } else {
        setError(err instanceof Error ? err.message : "Google sign-in failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const googleReady = hasGoogleClient() && workspace.trim().length > 0;

  return (
    <CinematicAuthShell
      footer={
        <>
          New to Conddo?{" "}
          <Link href="/onboarding/create-account" className="font-medium text-primary-light hover:text-white transition-colors">
            Create an account
          </Link>
        </>
      }
    >
      <AuthCard title="Welcome back" subtitle="Sign in to your business workspace.">
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-4 py-3 text-[13.5px] text-rose-200">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className={fieldLabelCls}>Workspace</label>
            <div className="flex">
              <input
                className={`${fieldInputCls} rounded-r-none`}
                placeholder="your-business"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                required
              />
              <span className="inline-flex h-11 items-center rounded-r-lg border border-l-0 border-white/10 bg-white/[0.02] px-3 font-mono text-[12.5px] text-white/45">
                .conddo.io
              </span>
            </div>
          </div>

          <div>
            <label className={fieldLabelCls}>Email address</label>
            <input
              className={fieldInputCls}
              type="email"
              placeholder="you@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className={fieldLabelCls}>Password</label>
            <div className="relative">
              <input
                className={`${fieldInputCls} pr-11`}
                type={show ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-[12.5px] font-medium text-primary-light hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[14.5px] font-medium text-ink transition-all hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? "Signing in…" : "Sign in"}
            {!submitting && <ArrowRight size={14} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>

        {hasGoogleClient() && (
          <>
            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[11px] uppercase tracking-loose text-white/40">or</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <ContinueWithGoogle
              disabled={!googleReady}
              onCredential={onGoogleCredential}
              onError={(msg) => setError(msg)}
            />
          </>
        )}
      </AuthCard>
    </CinematicAuthShell>
  );
}
