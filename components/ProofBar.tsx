import Image from "next/image";

// Social-proof avatars — real business-owner faces (free-license stock for now;
// swap for real customers later, see public/people/CREDITS.md).
const faces = [
  { src: "/people/owner-phone.jpg", alt: "Fashion business owner" },
  { src: "/people/owner-man-1.jpg", alt: "Retail business owner" },
  { src: "/people/owner-shop.jpg", alt: "Shop owner" },
  { src: "/people/owner-man-2.jpg", alt: "Service business owner" },
];

export function ProofBar() {
  return (
    <div className="border-b border-neutral-border bg-neutral-bg">
      <div className="container-x flex flex-col items-center justify-center gap-3 py-7 sm:flex-row sm:gap-4">
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
        <p className="text-center font-mono text-[12px] uppercase tracking-[0.12em] text-content-muted">
          Trusted by thousands of businesses across borders
        </p>
      </div>
    </div>
  );
}
