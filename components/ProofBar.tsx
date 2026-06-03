import Image from "next/image";

// Social-proof avatars — real business-owner faces (free-license stock for now;
// swap for real customers later, see public/people/CREDITS.md).
const faces = [
  { src: "/people/owner-phone.jpg", alt: "Fashion business owner" },
  { src: "/people/owner-man-1.jpg", alt: "Retail business owner" },
  { src: "/people/owner-shop.jpg", alt: "Shop owner" },
  { src: "/people/owner-man-2.jpg", alt: "Service business owner" },
];

// Concrete, scannable proof points. We don't have a customer count yet, so the
// first pill leads on the audience instead of an unsubstantiated "thousands of
// businesses" claim. The rest are verifiable: cities served, payment rail,
// launch timing. Swap to real numbers (signups / revenue processed) at scale.
const proof = [
  "Built for Nigerian SMEs",
  "Lagos · Abuja · Port Harcourt",
  "Naira-native payments",
  "Launching 2026",
];

export function ProofBar() {
  return (
    <div className="border-b border-neutral-border bg-neutral-bg">
      <div className="container-x flex flex-col items-center justify-center gap-4 py-7 sm:flex-row sm:gap-5">
        <div className="flex -space-x-3">
          {faces.map((f) => (
            <span
              key={f.src}
              className="relative h-10 w-10 overflow-hidden rounded-full ring-2 ring-neutral-bg"
            >
              <Image src={f.src} alt={f.alt} fill sizes="40px" className="object-cover" />
            </span>
          ))}
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.1em] text-content-muted">
          {proof.map((p, i) => (
            <li key={p} className="inline-flex items-center gap-3">
              {i > 0 && <span aria-hidden className="text-content-muted/40">·</span>}
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
