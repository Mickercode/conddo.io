"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2, ShieldAlert, ShieldCheck, Eye, EyeOff, Mail, CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  previewInvite,
  acceptInvite,
  type InvitePreview,
} from "@/lib/api/account";
import { landingPathFor, roleDefFor } from "@/lib/api/staff";
import { ApiError } from "@/lib/api/client";

/** Accept-invite landing — clean centered card (no sidebar) outside the
 *  authed shell. Reads ?token, previews who the invite is for, lets the
 *  staffer set a password, and routes them straight to their role landing
 *  on success. */
export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<Shell><Spinner label="Loading invite…" /></Shell>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!token) { setLoading(false); return; }
    (async () => {
      const p = await previewInvite(token);
      if (!active) return;
      setPreview(p);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setAccepting(true);
    try {
      await acceptInvite({
        token,
        password,
        fullName: fullName.trim() || undefined,
      });
      router.replace(landingPathFor(preview?.staffRole));
    } catch (err) {
      const apiErr = err instanceof ApiError ? err : null;
      if (apiErr?.code === "INVITE_EXPIRED" || apiErr?.code === "INVITE_INVALID") {
        setError("This invite is no longer active. Ask your owner to send a new one.");
      } else {
        setError(apiErr?.message ?? "Couldn't accept the invite. Please try again.");
      }
    } finally {
      setAccepting(false);
    }
  }

  if (loading) return <Shell><Spinner label="Loading invite…" /></Shell>;

  if (!token || !preview) {
    return (
      <Shell>
        <div className="text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-bg text-warning">
            <ShieldAlert size={24} />
          </span>
          <h1 className="text-[20px] font-medium text-ink">This invite isn't active</h1>
          <p className="mt-2 text-[14px] text-content-secondary">
            It may have expired, been used already, or the link is malformed. Ask the person who invited you to send a new one.
          </p>
          <Link href="/login" className="mt-5 inline-block">
            <Button variant="secondary" size="md">Go to sign in</Button>
          </Link>
        </div>
      </Shell>
    );
  }

  const roleDef = roleDefFor(preview.staffRole);

  return (
    <Shell>
      <div className="mb-6 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-bg text-success">
          <ShieldCheck size={24} />
        </span>
        <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-content-muted">You've been invited to</p>
        <h1 className="mt-1 text-[22px] font-medium text-ink">{preview.tenantName}</h1>
        <p className="mt-1 inline-flex items-center gap-2 text-[14px] text-content-secondary">
          as a <span className="font-medium text-ink">{roleDef.label}</span>
        </p>
        {preview.invitedBy && (
          <p className="mt-1 text-[12px] text-content-muted">
            Invited by {preview.invitedBy}
          </p>
        )}
      </div>

      {/* Access preview */}
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary-bg/30 p-4">
        <p className="mb-2 text-[12px] font-medium uppercase tracking-[0.05em] text-primary">
          What you'll be able to do
        </p>
        <ul className="space-y-1">
          {roleDef.access.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-content-secondary">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-success" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Email — read-only */}
        <div>
          <label className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-content-secondary">
            Email
          </label>
          <div className="flex items-center gap-2 rounded-md border border-neutral-border bg-neutral-surface2 px-3.5 py-2.5">
            <Mail size={14} className="text-content-muted" />
            <span className="text-[14px] text-ink">{preview.email}</span>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="ai-name" className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-content-secondary">
            Your name <span className="text-content-muted">(optional)</span>
          </label>
          <input
            id="ai-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="What should we call you?"
            className="h-11 w-full rounded-md border border-neutral-strong bg-neutral-surface px-3.5 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="ai-pwd" className="mb-1.5 block text-[12px] font-medium uppercase tracking-[0.06em] text-content-secondary">
            Set a password
          </label>
          <div className="relative">
            <input
              id="ai-pwd"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8 characters or more"
              autoComplete="new-password"
              required
              className="h-11 w-full rounded-md border border-neutral-strong bg-neutral-surface px-3.5 pr-10 text-[15px] text-ink placeholder:text-content-muted focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-content-muted hover:bg-neutral-surface2 hover:text-ink"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-md bg-danger-bg px-3 py-2 text-[12px] text-danger">{error}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={accepting}
        >
          {accepting ? (
            <><Loader2 size={15} className="animate-spin" /> Setting up your account…</>
          ) : (
            <>Accept and sign in <ArrowRight size={15} /></>
          )}
        </Button>

        <p className="text-center text-[11px] text-content-muted">
          By accepting, you agree to Conddo's terms of service.
        </p>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-bg px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Image src="/conddo_logo.png" alt="Conddo.io" width={120} height={32} className="h-8 w-auto" priority />
        </div>
        <div className="rounded-2xl border border-neutral-border bg-neutral-surface p-8">
          {children}
        </div>
      </div>
    </main>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <Loader2 size={28} className="animate-spin text-primary" />
      <p className="text-[13px] text-content-muted">{label}</p>
    </div>
  );
}
