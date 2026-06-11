// Paystack Inline — thin TS wrapper around the v2 inline.js SDK so the rest
// of the FE can call it without leaking `any` into pages. The SDK is loaded
// once globally via a <Script> in layout.tsx; this helper handles type
// declarations, fallback detection, and the "open transaction by accessCode"
// flow we use (BE creates the transaction first, FE just resumes it).
//
// Why Inline instead of the redirect-to-hosted flow:
// - User never leaves /settings/billing — modal opens on our page
// - Paystack still collects card data in their own iframe (no PCI DSS on us)
// - Callbacks fire synchronously on success / cancel — no return-page race

declare global {
  interface Window {
    PaystackPop?: {
      new (): PaystackPopInstance;
    };
  }
}

type PaystackPopInstance = {
  /** Resume an already-initialised Paystack transaction via its accessCode
   *  (returned by `POST /transaction/initialize` server-side). */
  resumeTransaction: (accessCode: string) => void;
  /** Start a fresh transaction client-side — we don't use this path today
   *  because the BE creates the transaction; kept for completeness. */
  newTransaction: (config: PaystackInlineConfig) => void;
};

export type PaystackInlineConfig = {
  key: string;
  email: string;
  amount: number;        // kobo
  ref: string;
  metadata?: Record<string, unknown>;
  callback: (response: PaystackInlineResponse) => void;
  onClose: () => void;
};

export type PaystackInlineResponse = {
  reference: string;
  status: "success" | "failed" | string;
  transaction?: string;
  trxref?: string;
};

/** Quick "is the SDK loaded and the public key configured?" check. The
 *  billing page uses this to decide between the Inline modal and a
 *  graceful fallback to the BE's hosted-checkout authorizationUrl. */
export function paystackInlineAvailable(): boolean {
  if (typeof window === "undefined") return false;
  if (!window.PaystackPop) return false;
  if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) return false;
  return true;
}

/** Open Paystack's Inline modal for a pre-initialised transaction. The
 *  `ref` matches what BE got from /transaction/initialize, so Paystack
 *  ties the modal to the existing server-side transaction (with all its
 *  metadata, callbacks, plan, etc).
 *
 *  Throws synchronously if the SDK isn't ready — callers should check
 *  `paystackInlineAvailable()` first and fall back to redirect. */
export function openPaystackInline(config: PaystackInlineConfig): void {
  if (!window.PaystackPop) {
    throw new Error("Paystack Inline SDK not loaded — call paystackInlineAvailable() first.");
  }
  const popup = new window.PaystackPop();
  // The v2 SDK doesn't accept callbacks on resumeTransaction directly —
  // the simplest path is newTransaction with the existing ref, which tells
  // Paystack to find + resume rather than create a duplicate.
  popup.newTransaction(config);
}
