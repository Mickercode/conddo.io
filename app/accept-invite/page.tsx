"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, ShieldAlert, ShieldCheck, Eye, EyeOff, Mail, CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CinematicAuthShell } from "@/components/auth/CinematicAuthShell";
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
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300 border border-amber-500/25">
            <ShieldAlert size={24} strokeWidth={1.5} />
          </span>
          <h1 className="text-balance text-[24px] font-semibold tracking-tighter text-white leading-[1.1]">
            This invite isn&apos;t active
          </h1>
          <p className="mt-3 text-[14.5px] text-white/65 leading-relaxed">
            It may have expired, been used already, or the link is malformed. Ask the person who invited you to send a new one.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-[13.5px] font-medium text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white"
          >
            Go to sign in
          </Link>
        </div>
      </Shell>
    );
  }

  const roleDef = roleDefFor(preview.staffRole);

  return (
    <Shell>
      <div className="mb-6 text-center">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
          <ShieldCheck size={24} strokeWidth={1.5} />
        </span>
        <p className="font-mono text-[11px] font-medium uppercase tracking-loose text-white/45">You&apos;ve been invited to</p>
        <h1 className="mt-1 text-balance text-[24px] font-semibold tracking-tighter text-white leading-[1.1]">{preview.tenantName}</h1>
        <p className="mt-1.5 inline-flex items-center gap-2 text-[14px] text-white/65">
          as a <span className="font-medium text-white">{roleDef.label}</span>
        </p>
        {preview.invitedBy && (
          <p className="mt-1.5 text-[12.5px] text-white/45">
            Invited by {preview.invitedBy}
          </p>
        )}
      </div>

      {/* Access preview */}
      <div className="mb-6 rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
        <p className="mb-2 font-mono text-[11px] font-medium uppercase tracking-loose text-primary-light">
          What you&apos;ll be able to do
        </p>
        <ul className="space-y-1.5">
          {roleDef.access.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-[13px] text-white/75">
              <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-300" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* Email — read-only */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-loose text-white/55">
            Email
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2.5">
            <Mail size={14} className="text-white/45" />
            <span className="text-[14px] text-white">{preview.email}</span>
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="ai-name" className="mb-1.5 block text-[11px] font-medium uppercase tracking-loose text-white/55">
            Your name <span className="text-white/35">(optional)</span>
          </label>
          <input
            id="ai-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="What should we call you?"
            className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 text-[15px] text-white placeholder:text-white/35 focus:border-primary-light focus:bg-white/[0.06] focus:outline-none"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="ai-pwd" className="mb-1.5 block text-[11px] font-medium uppercase tracking-loose text-white/55">
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
              className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3.5 pr-10 text-[15px] text-white placeholder:text-white/35 focus:border-primary-light focus:bg-white/[0.06] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-white/50 hover:bg-white/10 hover:text-white"
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-rose-400/20 bg-rose-500/[0.06] px-3.5 py-2.5 text-[12.5px] text-rose-200">{error}</p>
        )}

        <button
          type="submit"
          disabled={accepting}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[14.5px] font-medium text-ink transition-all hover:bg-white/90 disabled:opacity-60"
        >
          {accepting ? (
            <><Loader2 size={15} className="animate-spin" /> Setting up your account…</>
          ) : (
            <>Accept and sign in <ArrowRight size={15} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" /></>
          )}
        </button>

        <p className="text-center text-[11px] text-white/40">
          By accepting, you agree to Conddo&apos;s terms of service.
        </p>
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <CinematicAuthShell>
      <div className="cinema-tile p-8 md:p-9">{children}</div>
    </CinematicAuthShell>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <Loader2 size={28} className="animate-spin text-primary-light" />
      <p className="text-[13px] text-white/55">{label}</p>
    </div>
  );
}
