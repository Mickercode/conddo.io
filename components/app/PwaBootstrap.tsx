"use client";

import { useEffect } from "react";

// Chrome / Edge / Android fire this on pages that meet the install criteria
// (manifest + SW + HTTPS + heuristics). We intercept it, stash it on a
// global, and let any <InstallAppButton> fire prompt() when the user clicks.
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
  interface Window {
    /** Set by PwaBootstrap when beforeinstallprompt fires.
     *  Reset to null after prompt() resolves. */
    __conddoInstallPrompt: BeforeInstallPromptEvent | null;
  }
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    prompt(): Promise<void>;
  }
}

/** Mounted once in the root layout. Registers the service worker (which
 *  unlocks "Install app" on Chrome/Edge/Android) and stores the install-
 *  prompt event globally so any button can fire it. */
export function PwaBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Register the service worker. We don't await it — registration is
    // fire-and-forget and the SW activates on the next navigation anyway.
    if ("serviceWorker" in navigator) {
      // Defer to after first paint to avoid contending with hydration.
      window.addEventListener(
        "load",
        () => {
          navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
            /* swallow — page works without the SW, install just won't fire */
          });
        },
        { once: true },
      );
    }

    // Capture the install prompt so the InstallAppButton can fire it later.
    const onPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      window.__conddoInstallPrompt = e;
      // Notify any mounted button to re-render.
      window.dispatchEvent(new CustomEvent("conddo:install-available"));
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // Clear the stashed prompt once the user successfully installs.
    const onInstalled = () => {
      window.__conddoInstallPrompt = null;
      window.dispatchEvent(new CustomEvent("conddo:install-available"));
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
