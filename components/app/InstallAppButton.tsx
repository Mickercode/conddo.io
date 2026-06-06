"use client";

import { useEffect, useState } from "react";
import { Download, Share2, X, Smartphone } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

// True once the page is running inside the installed app (display-mode:
// standalone is set by Chromium / iOS when launched from the home screen).
function isInstalled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS legacy — Safari sets navigator.standalone
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

// iOS Safari never fires beforeinstallprompt — we have to tell the user to
// use Share → Add to Home Screen. Detect so the button can fall back to
// instructions instead of failing silently.
function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream;
}

/** "Install app" CTA — shows on every platform but adapts to what's possible:
 *
 *  - Chrome / Edge desktop / Android: clicks fire window.__conddoInstallPrompt.prompt().
 *  - iOS Safari: clicks open an instruction modal (Share → Add to Home Screen).
 *  - Already installed: hidden entirely. */
export function InstallAppButton({
  variant = "compact",
}: {
  variant?: "compact" | "full";
}) {
  const toast = useToast();
  const [available, setAvailable] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [iosHintOpen, setIosHintOpen] = useState(false);

  useEffect(() => {
    setInstalled(isInstalled());
    setAvailable(Boolean(window.__conddoInstallPrompt) || isIOS());
    const update = () => {
      setInstalled(isInstalled());
      setAvailable(Boolean(window.__conddoInstallPrompt) || isIOS());
    };
    window.addEventListener("conddo:install-available", update);
    return () => window.removeEventListener("conddo:install-available", update);
  }, []);

  if (installed || !available) return null;

  async function install() {
    if (isIOS() && !window.__conddoInstallPrompt) {
      setIosHintOpen(true);
      return;
    }
    const evt = window.__conddoInstallPrompt;
    if (!evt) {
      toast.error("Install isn't available right now", "Try again from your browser's address bar.");
      return;
    }
    try {
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      if (outcome === "accepted") {
        toast.success("App installed", "Look for Conddo on your home screen.");
      }
    } catch {
      /* user dismissed; no need to toast */
    } finally {
      window.__conddoInstallPrompt = null;
      setAvailable(false);
    }
  }

  return (
    <>
      {variant === "compact" ? (
        <button
          type="button"
          onClick={install}
          className="inline-flex items-center gap-2 rounded-md border border-neutral-border bg-neutral-surface px-3 py-1.5 text-[12px] font-medium text-content-secondary transition-colors hover:bg-neutral-surface2 hover:text-ink"
          title="Install Conddo as an app"
        >
          <Download size={14} />
          Install app
        </button>
      ) : (
        <Button variant="primary" size="md" onClick={install}>
          <Download size={16} /> Install Conddo
        </Button>
      )}

      <Modal
        open={iosHintOpen}
        onClose={() => setIosHintOpen(false)}
        title="Install Conddo on your iPhone"
        description="Safari doesn't auto-install, but you can add Conddo to your Home Screen in two taps."
        footer={
          <Button variant="primary" size="md" onClick={() => setIosHintOpen(false)}>
            Got it
          </Button>
        }
      >
        <ol className="space-y-3 text-[14px] text-content-secondary">
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-bg text-[12px] font-medium text-primary">1</span>
            <span>
              Tap the <Share2 size={14} className="inline -mt-1" /> Share button in Safari's toolbar
              (at the bottom of the screen).
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-bg text-[12px] font-medium text-primary">2</span>
            <span>
              Scroll down and tap <Smartphone size={14} className="inline -mt-1" />{" "}
              <strong className="text-ink">Add to Home Screen</strong>.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-bg text-[12px] font-medium text-primary">3</span>
            <span>
              Confirm the name and tap <strong className="text-ink">Add</strong>. Conddo will appear
              alongside your other apps.
            </span>
          </li>
        </ol>
        <button
          type="button"
          onClick={() => setIosHintOpen(false)}
          aria-label="Close"
          className="sr-only"
        >
          <X size={14} />
        </button>
      </Modal>
    </>
  );
}
