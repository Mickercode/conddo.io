"use client";

import { useEffect, type ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

/** Wraps every marketing route with the shared Nav + Footer so each page
 *  doesn't have to repeat the chrome. Also enforces the cinematic dark
 *  surface across the marketing tree — the legacy off-white body color
 *  ($--bg: #F8F8F6) bleeds through under the floating header otherwise,
 *  turning white nav text invisible.
 *
 *  Sets the html background via useEffect so overscroll / pull-to-
 *  refresh on iOS shows the dark surface instead of off-white. The
 *  wrapper itself carries the same color so the visible viewport is
 *  consistent on both ends. */
export function MarketingShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.backgroundColor;
    html.style.backgroundColor = "#0a0a0c";
    return () => {
      html.style.backgroundColor = prev;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#0a0a0c] text-white">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
