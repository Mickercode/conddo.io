"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/Button";

const links = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-200 ${
        scrolled
          ? "border-b border-neutral-border bg-neutral-bg/85 backdrop-blur"
          : "border-b border-transparent bg-neutral-bg"
      }`}
    >
      <nav className="container-x flex h-16 items-center justify-between">
        <Link href="#top" aria-label="conddo.io home" className="flex items-center">
          <Image
            src="/conddo_logo.png"
            alt="conddo.io"
            width={1800}
            height={480}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[15px] text-content-secondary transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
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
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-[15px] text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-3 text-[15px] font-medium text-content-secondary hover:bg-neutral-surface2 hover:text-ink"
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
