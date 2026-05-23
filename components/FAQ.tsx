"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Section, Eyebrow } from "./ui/Section";

const faqs = [
  {
    q: "Is Conddo.io a marketplace like Jumia?",
    a: "No. Conddo.io gives you your own platform — your own website, your own customer base, your own brand. You are not competing with other sellers on a shared marketplace.",
  },
  {
    q: "Does Conddo.io run ads for my business?",
    a: "Yes. Unlike most platforms, Conddo.io manages your Facebook and Instagram ads directly. Top up in Naira via Paystack. We handle the rest.",
  },
  {
    q: "Can I use Conddo.io without being tech-savvy?",
    a: "Yes. The platform is designed for business owners, not developers.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section tone="bg" id="about">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="text-[34px] leading-tight tracking-[-0.01em] md:text-[40px]">
          Questions, answered.
        </h2>
      </div>

      <div className="mx-auto mt-10 max-w-2xl divide-y divide-neutral-border border-y border-neutral-border">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="text-[16px] font-medium text-ink">{item.q}</span>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-surface2 text-content-secondary">
                  {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>
              <div
                className={`grid transition-all duration-200 ${
                  isOpen
                    ? "grid-rows-[1fr] pb-5 opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-xl text-[15px] leading-[1.7] text-content-secondary">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
