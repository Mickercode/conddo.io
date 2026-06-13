"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

/** Cross-route transition — sleek + silky. Wraps the entire app's
 *  children with a motion.div keyed by pathname so React tears down +
 *  remounts on every navigation, giving us a clean entrance per route.
 *
 *  Three coordinated layers on entrance:
 *    - Page content fades from 0 → 1 over 700ms (slow on purpose)
 *    - Slight 24px slide-up over the same window
 *    - Blur(12px → 0) over the first 500ms — this is what makes the
 *      page feel like it's "coming into focus" rather than slamming in.
 *
 *  Ease is [0.22, 1, 0.36, 1] — quintic ease-out, much gentler tail
 *  than the standard cubic. Movement decelerates noticeably toward the
 *  end so the final settle reads as cinematic rather than mechanical.
 *
 *  Respects prefers-reduced-motion: skips the blur + slide + delay,
 *  keeps a 200ms cross-fade so navigation still has a visible cue. */
export function CinematicTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (reducedMotion) {
    return (
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        // Quintic ease-out — gentle deceleration toward the end.
        ease: [0.22, 1, 0.36, 1],
        duration: 0.7,
        opacity: { duration: 0.6 },
        filter: { duration: 0.5 },
        y: { duration: 0.7 },
      }}
      style={{
        // Honour the existing page background so the blur entry doesn't
        // reveal whatever sits behind the transitioning element.
        willChange: "opacity, transform, filter",
      }}
    >
      {children}
    </motion.div>
  );
}
