import { Section, Eyebrow } from "./ui/Section";
import { Chip } from "./ui/Chip";

/**
 * Placeholder testimonials standing in for the CMS-driven block in the copy
 * deck ("[CMS — real customer quotes]"). Swap these for real quotes at launch.
 */
const testimonials = [
  {
    quote:
      "My orders used to live in three different WhatsApp chats. Now measurements, payments, and delivery are all in one place — I look far more professional to my clients.",
    name: "Amaka E.",
    business: "Amaka Styles",
    vertical: "Fashion",
    initials: "AE",
  },
  {
    quote:
      "I can finally see my stock and expiry dates at a glance, and customers book consultations online. We've cut out a lot of the daily chaos.",
    name: "Tunde A.",
    business: "Wellspring Pharmacy",
    vertical: "Pharmacy",
    initials: "TA",
  },
  {
    quote:
      "The Naira ad top-up changed everything. I run Instagram ads without a dollar card and track exactly which ones bring in clients.",
    name: "Biodun K.",
    business: "Beecroft Consulting",
    vertical: "Consulting",
    initials: "BK",
  },
];

export function SocialProof() {
  return (
    <Section tone="surface" className="border-y border-neutral-border">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Social proof</Eyebrow>
        <h2 className="text-[34px] leading-tight tracking-[-0.01em] md:text-[40px]">
          Businesses growing with Conddo.io.
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.business}
            className="flex h-full flex-col rounded-lg border border-neutral-border bg-neutral-bg p-6"
          >
            <Chip tone="primary">{t.vertical}</Chip>
            <blockquote className="mt-4 flex-1 text-[15px] leading-[1.7] text-content-secondary">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-bg font-mono text-[13px] font-medium text-primary">
                {t.initials}
              </span>
              <span>
                <span className="block text-[14px] font-medium text-ink">
                  {t.name}
                </span>
                <span className="block text-[13px] text-content-muted">
                  {t.business}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  );
}
