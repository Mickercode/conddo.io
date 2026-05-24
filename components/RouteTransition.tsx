"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader } from "./ui/Loader";

/**
 * Smooth branded page transition. On every route change the overlay snaps on
 * (covering the freshly-rendered page), the conddo mark spins for a beat, then
 * the overlay fades out to reveal the page. Works for both <Link> navigations
 * and programmatic router.push (the onboarding steps), since both change the
 * pathname. Skipped on first load and for prefers-reduced-motion users.
 */
type Phase = "hidden" | "shown" | "fading";

const HOLD_MS = 1000; // time the spinner is fully visible (~1.25 spins)
const FADE_MS = 300; // fade-out duration (keep in sync with the class below)

export function RouteTransition() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("hidden");
  const firstRender = useRef(true);

  // Trigger on pathname change (not the initial mount).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setPhase("shown");
    const t = setTimeout(() => setPhase("fading"), HOLD_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  // After the fade completes, unmount the overlay.
  useEffect(() => {
    if (phase !== "fading") return;
    const t = setTimeout(() => setPhase("hidden"), FADE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-neutral-bg motion-reduce:hidden ${
        phase === "fading" ? "opacity-0 transition-opacity duration-300" : "opacity-100"
      }`}
    >
      <Loader />
    </div>
  );
}
