import Link from "next/link";
import Image from "next/image";

const groups = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "About", href: "#about" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Contact", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink">
      <div className="container-x py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Image
              src="/conddo_logo_dark.png"
              alt="conddo.io"
              width={1800}
              height={480}
              className="h-8 w-auto"
            />
            <p className="mt-4 text-[14px] text-white/50">Sell more. Stress less.</p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-20">
            {groups.map((g) => (
              <div key={g.heading}>
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">
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
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-[13px] text-white/40">
            © 2026 Conddo.io by Handel Cores.
          </p>
        </div>
      </div>
    </footer>
  );
}
