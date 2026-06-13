"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, ArrowRight, Sparkles } from "lucide-react";

/** Marketing nav links. /product is the deep-dive (so we don't clash with
 *  the dashboard's auth-gated /features), /businesses is "Solutions" in
 *  the footer's language but stays "Businesses" in the header for
 *  scannability. */
const links: { label: string; href: string }[] = [
  { label: "Product", href: "/product" },
  { label: "Businesses", href: "/businesses" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

/** Cinematic floating glass header. Departs from the conventional bar that
 *  the previous version had — this one is a centered floating capsule that
 *  reads as part of the cinematic dark surface, not a brochure header tacked
 *  on top.
 *
 *  Two pieces:
 *    - Top-left brand mark (Conddo logo)
 *    - Top-center floating glass pill with the route links
 *    - Top-right utility group (Sign in + Get Started)
 *
 *  At scroll > 8px the brand + utility group settle into their floating
 *  panels with subtle backdrop-blur, so the header reads as actively
 *  present without occluding hero content. */
export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 pointer-events-none">
      {/* The header is a thin overlay strip — its children pick up
          pointer-events back so the floating panels stay clickable. */}
      <div
        className={`pointer-events-none relative transition-all duration-300 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <div className="container-x flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            aria-label="conddo.io home"
            className={`pointer-events-auto inline-flex items-center rounded-full transition-all duration-300 ${
              scrolled
                ? "border border-white/10 bg-white/[0.04] backdrop-blur-xl px-3 py-2"
                : "px-1"
            }`}
          >
            <Image
              src="/conddo_logo_dark.png"
              alt="conddo.io"
              width={1800}
              height={480}
              priority
              className="h-7 w-auto"
            />
          </Link>

          {/* Center floating capsule — the route links. Sit centered on
              wide screens, hidden under md (mobile drawer takes over). */}
          <nav className="pointer-events-auto absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <div className="flex items-center rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl p-1.5">
              {links.map((l) => {
                const active = isActive(pathname, l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex items-center px-4 py-1.5 text-[13.5px] font-medium tracking-tight transition-colors rounded-full ${
                      active ? "text-white" : "text-white/65 hover:text-white"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className="absolute inset-0 rounded-full bg-white/10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative">{l.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Utility — Sign in (ghost) + Get Started (primary). Both
              clickable through the pointer-events-none wrapper. */}
          <div className="pointer-events-auto hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 text-[13.5px] font-medium text-white/75 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/onboarding/create-account"
              className="group inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13.5px] font-medium text-ink transition-all hover:bg-white/90 hover:gap-2"
            >
              Get started
              <ArrowRight size={13} strokeWidth={2.5} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-xl text-white md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — full-bleed glass panel that drops down under the
          floating header. Dark to match the cinematic surface. */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto md:hidden"
        >
          <div className="container-x">
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0c]/95 backdrop-blur-2xl p-3 shadow-2xl">
              <ul className="flex flex-col gap-1">
                {links.map((l) => {
                  const active = isActive(pathname, l.href);
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-[15px] transition-colors ${
                          active
                            ? "bg-white/10 font-medium text-white"
                            : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        {l.label}
                        <ArrowRight size={14} className={active ? "text-primary-light" : "text-white/30"} />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <div className="my-3 border-t border-white/10" />
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-[14px] font-medium text-white/80 transition-colors hover:bg-white/[0.04]"
                >
                  Sign in
                </Link>
                <Link
                  href="/onboarding/create-account"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-[14px] font-medium text-ink"
                >
                  <Sparkles size={13} />
                  Start free trial
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
