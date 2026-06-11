"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut, type LucideIcon } from "lucide-react";
import { getAccessToken } from "@/lib/api/auth";
import { refreshAccessToken } from "@/lib/api/client";
import { useApiQuery } from "@/hooks/useApiQuery";
import { logout, meQuery } from "@/lib/api/account";
import { landingPathFor, roleDefFor } from "@/lib/api/staff";

export type WorkNavItem = { label: string; href: string; icon: LucideIcon };

/** Lean app shell for staff users. Mirrors AppShell's structure (desktop
 *  permanent sidebar, mobile drawer, auth guard) but renders a much shorter
 *  nav scoped to a single role — no temptation, no clutter, no accidental
 *  navigation into admin-only surfaces.
 *
 *  Auth guard: if a TENANT_ADMIN somehow lands inside /work (they shouldn't,
 *  but bookmarks happen), we bounce them to /dashboard. Same in reverse for
 *  STAFF users landing on /dashboard. */
export function WorkShell({
  title,
  subtitle,
  actions,
  nav,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  nav: WorkNavItem[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const { data: me } = useApiQuery(meQuery);

  // Standard client-side auth guard — same shape AppShell uses.
  useEffect(() => {
    let active = true;
    (async () => {
      if (getAccessToken()) { if (active) setAuthed(true); return; }
      const recovered = await refreshAccessToken();
      if (!active) return;
      if (recovered) setAuthed(true);
      else { setAuthed(false); router.replace("/login"); }
    })();
    return () => { active = false; };
  }, [router]);

  // Cross-shell guard: owners shouldn't be on /work. Route them home.
  useEffect(() => {
    if (!me) return;
    if (me.user.role === "TENANT_ADMIN" || me.user.role === "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [me, router]);

  // /work (no specific suffix) routes the staffer to their role's landing.
  useEffect(() => {
    if (!me) return;
    if (pathname === "/work") {
      router.replace(landingPathFor(me.user.staffRole));
    }
  }, [me, pathname, router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (authed !== true) {
    return <div className="min-h-screen bg-neutral-bg" />;
  }

  const roleDef = roleDefFor(me?.user.staffRole);
  const tenantName = me?.tenant.name ?? "Workspace";
  const userName = me?.user.fullName ?? me?.user.email ?? "Staff";
  const initials = me?.user.initials ?? "?";

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-neutral-border bg-neutral-surface lg:block">
        <SidebarBody
          pathname={pathname}
          nav={nav}
          tenantName={tenantName}
          userName={userName}
          initials={initials}
          roleLabel={roleDef.label}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[15rem] max-w-[82%] border-r border-neutral-border bg-neutral-surface">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-content-secondary hover:bg-neutral-surface2"
            >
              <X size={16} />
            </button>
            <SidebarBody
              pathname={pathname}
              nav={nav}
              tenantName={tenantName}
              userName={userName}
              initials={initials}
              roleLabel={roleDef.label}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-neutral-border bg-neutral-bg/80 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-content-secondary hover:bg-neutral-surface2 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-[18px] font-medium text-ink sm:text-[20px]">{title}</h1>
              {subtitle && <p className="truncate text-[12px] text-content-muted">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarBody({
  pathname,
  nav,
  tenantName,
  userName,
  initials,
  roleLabel,
  onLogout,
}: {
  pathname: string;
  nav: WorkNavItem[];
  tenantName: string;
  userName: string;
  initials: string;
  roleLabel: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      {/* Tenant header */}
      <div className="border-b border-neutral-border px-4 py-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-content-muted">Workspace</p>
        <p className="mt-0.5 truncate text-[14px] font-medium text-ink">{tenantName}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-[14px] transition-colors ${
                    active
                      ? "bg-primary-bg font-medium text-primary"
                      : "text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User strip */}
      <div className="border-t border-neutral-border px-4 py-3">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-bg font-mono text-[12px] font-semibold text-primary">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-ink">{userName}</p>
            <p className="truncate text-[11px] text-content-muted">{roleLabel}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-neutral-border bg-neutral-surface px-3 py-1.5 text-[12px] font-medium text-content-secondary transition-colors hover:border-danger hover:text-danger"
        >
          <LogOut size={12} /> Sign out
        </button>
      </div>
    </div>
  );
}
