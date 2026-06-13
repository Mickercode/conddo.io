import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";

/** Sitemap-shaped footer — each column matches a top-level nav surface so
 *  visitors can land on any deep page from anywhere. Last column is the
 *  utility/legal stack. Verticals get their own section so the music
 *  studio + fashion + pharmacy landings are reachable from the global
 *  footer (good for SEO + cross-discovery). */
const groups: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Overview",   href: "/product" },
      { label: "Pricing",    href: "/pricing" },
      { label: "Start free", href: "/onboarding/create-account" },
      { label: "Sign in",    href: "/login" },
    ],
  },
  {
    heading: "Verticals",
    links: [
      { label: "Pharmacy",     href: "/businesses/pharmacy" },
      { label: "Fashion",      href: "/businesses/fashion" },
      { label: "Music Studio", href: "/businesses/music-studio" },
      { label: "Browse all",   href: "/businesses" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About",   href: "/about" },
      { label: "Contact", href: "mailto:hello@conddo.io" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Terms",   href: "/legal/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink">
      <div className="container-x py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          {/* Brand column */}
          <div>
            <Link href="/" aria-label="conddo.io home" className="inline-block">
              <Image
                src="/conddo_logo_dark.png"
                alt="conddo.io"
                width={1800}
                height={480}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-xs text-pretty text-[14px] leading-relaxed text-white/55">
              The operating system for Nigerian businesses. Sell more, stress less.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.12em] text-primary-light backdrop-blur">
              <Sparkles size={10} />
              Launching 2026
            </span>
          </div>

          {/* Link columns */}
          {groups.map((g) => (
            <div key={g.heading}>
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-white/40">
                {g.heading}
              </p>
              <ul className="space-y-3">
                {g.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[14px] text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar — copyright + a small "made in Lagos" tag. */}
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-white/40">
            © 2026 Conddo.io by Handel Cores. All rights reserved.
          </p>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/35">
            Made in Lagos
          </p>
        </div>
      </div>
    </footer>
  );
}
