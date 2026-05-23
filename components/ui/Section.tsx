import type { ReactNode } from "react";

type Tone = "bg" | "surface" | "purple" | "dark" | "violet";

const tones: Record<Tone, string> = {
  bg: "bg-neutral-bg text-content-secondary",
  surface: "bg-neutral-surface text-content-secondary",
  purple: "bg-primary-bg text-content-secondary",
  dark: "bg-ink text-white/70",
  violet: "bg-primary text-white",
};

/**
 * A full-bleed section that owns its background tone and vertical rhythm,
 * with the 1280px container nested inside. Tone drives the
 * "Section Sequence Rule" — alternate with intention, never two darks
 * or two purples back to back.
 */
export function Section({
  tone = "bg",
  id,
  children,
  className = "",
  containerClassName = "",
}: {
  tone?: Tone;
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section id={id} className={`section-y ${tones[tone]} ${className}`}>
      <div className={`container-x ${containerClassName}`}>{children}</div>
    </section>
  );
}

/** Small uppercase violet eyebrow used above section headlines. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow mb-4">{children}</p>;
}
