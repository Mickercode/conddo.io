// Pharmacy Cashback Loyalty — Roadmap Beta 1.
//
// Customers earn a cashback percentage on every order. Cashback accrues in a
// wallet (one per tenant+customer) and can be redeemed at checkout as a
// discount. Credited on order DELIVERED status, not on placement.
//
// Expected BE paths (normalised to /api/v1/pharmacy/loyalty/*):
//   GET  /api/v1/pharmacy/loyalty/config
//   PUT  /api/v1/pharmacy/loyalty/config
//   GET  /api/v1/pharmacy/loyalty/wallets
//   GET  /api/v1/pharmacy/loyalty/wallets/{customerId}
//   GET  /api/v1/pharmacy/loyalty/wallets/{customerId}/transactions
//
// Tenant from JWT.

import { api } from "./client";

export type LoyaltyConfig = {
  /** Percentage credited on each delivered order (e.g. 2 = 2%). */
  cashbackRate: number;
  /** Minimum wallet balance before customer can redeem (in NGN). */
  minRedemption: number;
  isActive: boolean;
  updatedAt?: string;
};

export type LoyaltyConfigInput = Partial<LoyaltyConfig>;

export type CustomerWallet = {
  customerId: string;
  /** Server-joined for the list view; absent on the single-wallet endpoint. */
  customerName?: string | null;
  customerPhone?: string | null;
  balance: number;
  totalEarned: number;
  totalRedeemed: number;
  updatedAt?: string;
};

export type WalletTransactionType =
  | "CASHBACK_EARNED"
  | "REDEMPTION"
  | "ADJUSTMENT"
  | "EXPIRY";

export type WalletTransaction = {
  id: string;
  transactionType: WalletTransactionType;
  amount: number;            // signed: positive = credit, negative = debit
  referenceId?: string | null;  // order_id when type=CASHBACK_EARNED|REDEMPTION
  note?: string | null;
  createdAt: string;
};

const BASE = "/pharmacy/loyalty";

export const loyaltyApi = {
  getConfig: () => api.get<LoyaltyConfig>(`${BASE}/config`),
  setConfig: (body: LoyaltyConfigInput) =>
    api.put<LoyaltyConfig>(`${BASE}/config`, body),

  listWallets: (search?: string) => {
    const qs = search ? `?search=${encodeURIComponent(search)}` : "";
    return api.get<CustomerWallet[]>(`${BASE}/wallets${qs}`);
  },
  getWallet: (customerId: string) =>
    api.get<CustomerWallet>(`${BASE}/wallets/${customerId}`),
  walletTransactions: (customerId: string) =>
    api.get<WalletTransaction[]>(`${BASE}/wallets/${customerId}/transactions`),
};

export const WALLET_TX_LABELS: Record<WalletTransactionType, string> = {
  CASHBACK_EARNED: "Cashback earned",
  REDEMPTION:      "Redeemed at checkout",
  ADJUSTMENT:      "Manual adjustment",
  EXPIRY:          "Expired",
};

export function walletTxTone(t: WalletTransactionType): "success" | "danger" | "neutral" | "warning" {
  switch (t) {
    case "CASHBACK_EARNED": return "success";
    case "REDEMPTION":      return "danger";
    case "ADJUSTMENT":      return "neutral";
    case "EXPIRY":          return "warning";
  }
}
