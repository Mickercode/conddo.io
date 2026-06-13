"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Liquid-blur morphing text — the inline word that replaces "business" in
 *  Conddo's hero headline cycles through {business, pharmacy, fashion brand,
 *  music studio, salon, …} with a slow blur + opacity morph. Much more
 *  cinematic than a hard cross-fade. Honours reduced-motion (just shows the
 *  first word).
 *
 *  Two stacked spans share the same position — one fades out blurred while
 *  the other fades in unblurred, then they swap roles. Driven by
 *  requestAnimationFrame so the morph is smooth regardless of refresh rate. */

const MORPH_TIME = 1.6;       // seconds the blur transition lasts
const COOLDOWN_TIME = 1.2;    // seconds the readable word lingers before next

function useMorphingText(texts: string[]) {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef<Date | null>(null);
  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [c1, c2] = [text1Ref.current, text2Ref.current];
      if (!c1 || !c2 || texts.length === 0) return;

      c2.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      c2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const inv = 1 - fraction;
      c1.style.filter = `blur(${Math.min(8 / inv - 8, 100)}px)`;
      c1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;

      c1.textContent = texts[textIndexRef.current % texts.length];
      c2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts],
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;
    let fraction = morphRef.current / MORPH_TIME;
    if (fraction > 1) {
      cooldownRef.current = COOLDOWN_TIME;
      fraction = 1;
    }
    setStyles(fraction);
    if (fraction === 1) textIndexRef.current++;
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [c1, c2] = [text1Ref.current, text2Ref.current];
    if (c1 && c2) {
      c2.style.filter = "none";
      c2.style.opacity = "100%";
      c1.style.filter = "none";
      c1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    // Respect prefers-reduced-motion — show the first word, skip the morph.
    if (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const c1 = text1Ref.current;
      if (c1) {
        c1.textContent = texts[0] ?? "";
        c1.style.opacity = "100%";
        c1.style.filter = "none";
      }
      return;
    }

    let animationFrameId: number;
    timeRef.current = new Date();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const newTime = new Date();
      const dt = (newTime.getTime() - (timeRef.current?.getTime() ?? newTime.getTime())) / 1000;
      timeRef.current = newTime;
      cooldownRef.current -= dt;
      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [doMorph, doCooldown, texts]);

  return { text1Ref, text2Ref };
}

/** Inline morphing text — used WITHIN a sentence (the hero head). The parent
 *  controls the font/size; this just renders the morphing word. */
export function LiquidText({
  words,
  className,
}: {
  words: string[];
  className?: string;
}) {
  const { text1Ref, text2Ref } = useMorphingText(words);
  return (
    <span
      className={cn(
        "relative inline-block align-baseline [filter:url(#liquidtext-threshold)_blur(0.6px)]",
        className,
      )}
      // Width set by the longest word — JS sets visibility via opacity, but
      // we need layout space reserved so the surrounding text doesn't shift.
      style={{ minWidth: `${Math.max(...words.map((w) => w.length)) * 0.55}em` }}
    >
      <span ref={text1Ref} className="absolute inset-0 inline-block whitespace-nowrap" />
      <span ref={text2Ref} className="absolute inset-0 inline-block whitespace-nowrap" />
      {/* Invisible spacer so the inline word reserves layout space equal to
          the longest variant. */}
      <span className="invisible whitespace-nowrap">
        {words.reduce((a, b) => (a.length >= b.length ? a : b), "")}
      </span>
      <LiquidTextFilter />
    </span>
  );
}

/** SVG threshold filter that turns the blur+opacity transition into a
 *  liquid-merge effect. Rendered once globally; the filter is reused across
 *  every LiquidText instance on the page. */
function LiquidTextFilter() {
  return (
    <svg id="liquidtext-svg" className="hidden" preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id="liquidtext-threshold">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 255 -140"
          />
        </filter>
      </defs>
    </svg>
  );
}
