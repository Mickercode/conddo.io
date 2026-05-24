"use client";

import { useEffect, useState } from "react";

/**
 * Cycles a highlighted word in a headline (e.g. the business verticals), with a
 * small fade-up on each change. Falls back to the first word with no motion for
 * prefers-reduced-motion users.
 */
export function RotatingWord({
  words,
  intervalMs = 2200,
  className = "",
}: {
  words: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [i, setI] = useState(0);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    const t = setInterval(() => setI((p) => (p + 1) % words.length), intervalMs);
    return () => clearInterval(t);
  }, [words.length, intervalMs]);

  return (
    // inline-grid keeps the baseline stable while the word swaps
    <span className={`relative inline-flex ${className}`}>
      <span
        key={i}
        style={animate ? { animation: "wordIn 0.5s ease" } : undefined}
        className="inline-block"
      >
        {words[i]}
      </span>
    </span>
  );
}
