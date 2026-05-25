"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { login, slugify } from "@/lib/api/account";

const inputCls =
  "h-11 w-full rounded-md border border-neutral-strong bg-neutral-surface px-3.5 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none";
const labelCls = "mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-content-secondary";

export default function LoginPage() {
  const router = useRouter();
  const [workspace, setWorkspace] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password, tenantSlug: slugify(workspace) });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Check your details and try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image src="/conddo_logo.png" alt="conddo.io" width={1800} height={480} priority className="h-8 w-auto" />
        </div>

        <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-7 sm:p-8">
          <header className="mb-6 text-center">
            <h1 className="text-[24px] leading-tight tracking-[-0.01em] text-ink">Welcome back</h1>
            <p className="mt-1.5 text-[15px] text-content-secondary">Sign in to your business workspace.</p>
          </header>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger-bg px-4 py-3 text-[14px] text-danger">
              <AlertCircle size={18} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Workspace</label>
              <div className="flex">
                <input
                  className={`${inputCls} rounded-r-none`}
                  placeholder="your-business"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  required
                />
                <span className="inline-flex h-11 items-center rounded-r-md border border-l-0 border-neutral-strong bg-neutral-surface2 px-3 font-mono text-[13px] text-content-muted">
                  .conddo.io
                </span>
              </div>
            </div>
            <div>
              <label className={labelCls}>Email address</label>
              <input
                className={inputCls}
                type="email"
                placeholder="you@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input
                  className={`${inputCls} pr-11`}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-content-secondary"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="mt-1.5 text-right">
                <Link href="/forgot-password" className="text-[13px] font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button variant="primary" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 size={18} className="animate-spin" /> : null}
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[14px] text-content-secondary">
          New to conddo.io?{" "}
          <Link href="/onboarding/create-account" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
