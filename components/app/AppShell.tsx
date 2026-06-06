"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Bell, LogOut, Menu, Search, X } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useAppNav } from "@/hooks/useAppNav";
import { useActiveModulePaths, isPathAllowed } from "@/hooks/useModuleAccess";
import type { NavLink } from "@/lib/manifest/types";
import { logout, meQuery, type Me } from "@/lib/api/account";
import { getAccessToken } from "@/lib/api/auth";
import { refreshAccessToken } from "@/lib/api/client";
import { InstallAppButton } from "@/components/app/InstallAppButton";

type Identity = { businessName: string; userName: string; roleLabel: string; initials: string };

const FALLBACK_IDENTITY: Identity = { businessName: "Your workspace", userName: "Account", roleLabel: "", initials: "?" };

// Sidebar role label — visible under the user's name. TENANT_ADMIN reads as
// "Owner" to make it clear it's THIS workspace's owner, not a platform admin
// (matches Stripe / Linear / Notion / Slack convention). STAFF is plain "Staff
// member" so it doesn't read like internal Conddo staff.
const roleLabel = (role?: string) =>
  role === "TENANT_ADMIN" ? "Owner" :
  role === "STAFF" ? "Staff member" :
  role === "CUSTOMER" ? "Customer" :
  role ?? "";

function deriveIdentity(me: Me | null): Identity {
  if (!me) return FALLBACK_IDENTITY;
  const userName = me.user.fullName?.trim() || me.user.email;
  const initials =
    me.user.initials && me.user.initials !== "?"
      ? me.user.initials
      : (me.user.fullName?.trim()
          ? me.user.fullName.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join("")
          : me.user.email[0] ?? "?"
        ).toUpperCase();
  return { businessName: me.tenant.name, userName, roleLabel: roleLabel(me.user.role), initials };
}

function SidebarBody({
  pathname,
  identity,
  nav,
  onNavigate,
  onLogout,
}: {
  pathname: string;
  identity: Identity;
  nav: NavLink[];
  onNavigate?: () => void;
  onLogout?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="px-5 py-5">
        <Link href="/dashboard" onClick={onNavigate} className="inline-block">
          <Image
            src="/conddo_logo.png"
            alt="conddo.io"
            width={1800}
            height={480}
            priority
            className="h-7 w-auto"
          />
        </Link>
        <p className="mt-2 truncate text-[12px] text-content-muted">{identity.businessName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-[14px] transition-colors ${
                active
                  ? "bg-primary-bg font-medium text-primary"
                  : "text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-neutral-border px-4 py-4">
        {/* Install-app CTA — hidden when already installed or when the
            platform doesn't support installable webapps. */}
        <div className="mb-3 [&:empty]:hidden">
          <InstallAppButton variant="compact" />
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-bg font-mono text-[12px] font-medium text-primary">
            {identity.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{identity.userName}</p>
            <p className="text-[11px] text-content-muted">{identity.roleLabel || "Member"}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Sign out"
            title="Sign out"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The authenticated app shell: a sidebar that is permanently open on desktop
 * (consistent across every screen) and collapses into a dismissable drawer on
 * mobile, plus a top bar with the page title and per-page actions.
 */
export function AppShell({
  title,
  subtitle,
  actions,
  backHref,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backHref?: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const { data: me } = useApiQuery<Me>(meQuery);
  const identity = deriveIdentity(me);
  const nav = useAppNav();
  const modulePaths = useActiveModulePaths();

  // Client-side auth guard: app screens require an access token. If it's missing
  // (e.g. cleared/expired on reload) we try the refresh cookie once before
  // bouncing to /login. Renders nothing until resolved, to avoid a protected-UI flash.
  useEffect(() => {
    let active = true;
    (async () => {
      if (getAccessToken()) {
        if (active) setAuthed(true);
        return;
      }
      const recovered = await refreshAccessToken();
      if (!active) return;
      if (recovered) {
        setAuthed(true);
      } else {
        setAuthed(false);
        router.replace("/login");
      }
    })();
    return () => {
      active = false;
    };
  }, [router]);

  // Plan/vertical access guard: when the tenant's manifest is known, a route for
  // a module they don't have (e.g. /inventory on a plan without it) bounces to
  // Home. Unguarded when modulePaths is null (no manifest → static-nav fallback).
  useEffect(() => {
    if (authed !== true || modulePaths === null) return;
    if (!isPathAllowed(pathname, modulePaths)) router.replace("/dashboard");
  }, [authed, modulePaths, pathname, router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (authed !== true) {
    return <div className="min-h-screen bg-neutral-bg" />;
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Desktop sidebar — always open. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-neutral-border bg-neutral-surface lg:block">
        <SidebarBody pathname={pathname} identity={identity} nav={nav} onLogout={handleLogout} />
      </aside>

      {/* Mobile drawer — collapsible. */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[17rem] max-w-[82%] border-r border-neutral-border bg-neutral-surface">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-content-secondary hover:bg-neutral-surface2"
            >
              <X size={18} />
            </button>
            <SidebarBody
              pathname={pathname}
              identity={identity}
              nav={nav}
              onNavigate={() => setOpen(false)}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-neutral-border bg-neutral-bg/85 px-4 py-4 backdrop-blur md:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink hover:bg-neutral-surface2 lg:hidden"
            >
              <Menu size={20} />
            </button>
            {backHref && (
              <Link
                href={backHref}
                aria-label="Go back"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
              >
                <ArrowLeft size={19} />
              </Link>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-[18px] font-medium leading-tight tracking-[-0.01em] text-ink md:text-[20px]">
                {title}
              </h1>
              {subtitle && <p className="truncate text-[13px] text-content-muted">{subtitle}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/search"
              aria-label="Search"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-surface2 hover:text-ink ${
                pathname === "/search" ? "bg-primary-bg text-primary" : "text-content-secondary"
              }`}
            >
              <Search size={19} />
            </Link>
            <Link
              href="/notifications"
              aria-label="Notifications"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-neutral-surface2 hover:text-ink ${
                pathname === "/notifications" ? "bg-primary-bg text-primary" : "text-content-secondary"
              }`}
            >
              <Bell size={19} />
            </Link>
            {actions}
          </div>
        </header>

        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
