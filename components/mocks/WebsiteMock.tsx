import { Shirt, ArrowRight } from "lucide-react";
import { Frame } from "./Frame";

const products = [
  { name: "Ankara Wrap Dress", price: "₦42,000" },
  { name: "Tailored Agbada", price: "₦85,000" },
  { name: "Silk Gele Set", price: "₦28,000" },
];

export function WebsiteMock() {
  return (
    <Frame url="amaka-styles.conddo.io">
      <div className="bg-neutral-surface">
        {/* Site nav */}
        <div className="flex items-center justify-between border-b border-neutral-border px-5 py-3">
          <span className="text-sm font-medium text-ink">Amaka Styles</span>
          <div className="hidden items-center gap-4 text-[12px] text-content-secondary sm:flex">
            <span>Shop</span>
            <span>About</span>
            <span className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-white">
              Book a fitting
            </span>
          </div>
        </div>

        {/* Site hero */}
        <div className="grid grid-cols-1 items-center gap-4 px-5 py-6 sm:grid-cols-2">
          <div>
            <p className="text-[19px] font-medium leading-tight text-ink">
              Bespoke fashion, made to measure.
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-content-secondary">
              Handcrafted in Lagos. Delivered nationwide.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[12px] font-medium text-white">
              Shop the collection <ArrowRight size={13} />
            </span>
          </div>
          <div className="flex h-28 items-center justify-center rounded-lg bg-primary-bg">
            <Shirt size={40} className="text-primary" strokeWidth={1.5} />
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-3 gap-3 border-t border-neutral-border px-5 py-5">
          {products.map((p) => (
            <div key={p.name}>
              <div className="mb-2 flex h-16 items-center justify-center rounded-md bg-neutral-surface2">
                <Shirt size={20} className="text-content-muted" strokeWidth={1.5} />
              </div>
              <p className="truncate text-[11px] text-ink">{p.name}</p>
              <p className="font-mono text-[12px] font-medium text-ink">{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}
