"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/Button";

/** Marketing nav links — each one is a real route now (was anchors). The
 *  paths are clear marketing language; /product is the features deep-dive
 *  (so we don't clash with the dashboard's auth-gated /features roadmap).
 *  Order is the order they read in the bar. */
const links: { label: string; href: string }[] = [
  { label: "Product", href: "/product" },
  { label: "Businesses", href: "/businesses" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

/** Predicate for the active route highlight. The home route ("/") only
 *  matches the exact pathname so that opening /product doesn't make Home
 *  light up too. Sub-routes (e.g. /businesses/pharmacy) light up their
 *  top-level (/businesses) link. */
const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

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

  // Close the mobile drawer when the route changes — otherwise it stays
  // visually open after a navigation and the next click feels broken.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "border-b border-neutral-border bg-neutral-bg/85 backdrop-blur"
          : "border-b border-transparent bg-neutral-bg"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="/" aria-label="conddo.io home" className="flex items-center">
          <Image
            src="/conddo_logo.png"
            alt="conddo.io"
            width={1800}
            height={480}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop links — center-bias the route list so it reads as the
            primary nav, with utility actions (Sign in / Get started) right-
            aligned per Stripe / Linear / Vercel convention. */}
        <div className="hidden items-center gap-7 md:flex">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`relative text-[15px] transition-colors ${
                  active
                    ? "text-ink"
                    : "text-content-secondary hover:text-ink"
                }`}
              >
                {l.label}
                {active && (
                  <span className="pointer-events-none absolute -bottom-[18px] left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {/* Sign in — for returning users. Sits to the left of Get Started so
              the visual weight reads as "new users go right, existing users
              go left" (matches Stripe/Linear/Vercel convention). */}
          <Link
            href="/login"
            className="text-[15px] font-medium text-content-secondary transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Button href="/onboarding/create-account" variant="primary" size="md">
            Get Started
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-ink md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-neutral-border bg-neutral-bg md:hidden">
          <div className="container-x flex flex-col gap-1 py-4">
            {links.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-md px-3 py-3 text-[15px] transition-colors ${
                    active
                      ? "bg-primary-bg font-medium text-primary"
                      : "text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="my-2 border-t border-neutral-border" />
            <Link
              href="/login"
              className="rounded-md px-3 py-3 text-[15px] font-medium text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
            >
              Sign in
            </Link>
            <Button
              href="/onboarding/create-account"
              variant="primary"
              size="md"
              className="mt-2"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
