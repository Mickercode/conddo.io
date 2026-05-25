// Demo customer data for the Customer Profile screen (still on demo until its
// endpoints ship). The Customer type + tagTone are owned by the API service layer
// (lib/api/customers.ts) — re-exported here so existing imports keep working.
import { type Customer, type CustomerTag, tagTone } from "@/lib/api/customers";

export type { Customer, CustomerTag };
export { tagTone };

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

export const CUSTOMERS: Customer[] = [
  { id: "chioma-eze", name: "Chioma Eze", initials: "CE", phone: "+234 803 123 4567", email: "chioma.eze@gmail.com", totalSpent: 105000, orders: 4, lastActive: "3 days ago", tag: "VIP" },
  { id: "funmi-adeyemi", name: "Funmi Adeyemi", initials: "FA", phone: "+234 701 987 6543", email: "funmi.a@gmail.com", totalSpent: 67500, orders: 2, lastActive: "1 week ago", tag: null },
  { id: "ngozi-obi", name: "Ngozi Obi", initials: "NO", phone: "+234 812 555 0123", email: "ngozi.obi@yahoo.com", totalSpent: 41000, orders: 1, lastActive: "2 weeks ago", tag: "New" },
  { id: "blessing-okonkwo", name: "Blessing Okonkwo", initials: "BO", phone: "+234 906 777 8888", email: "blessing.ok@gmail.com", totalSpent: 0, orders: 0, lastActive: "Never", tag: "Lead" },
  { id: "abebi-lawal", name: "Abebi Lawal", initials: "AL", phone: "+234 805 222 1190", email: "abebi.lawal@gmail.com", totalSpent: 52300, orders: 3, lastActive: "5 days ago", tag: null },
  { id: "babatunde-soyinka", name: "Babatunde Soyinka", initials: "BS", phone: "+234 703 884 2231", email: "tunde.soyinka@gmail.com", totalSpent: 88900, orders: 5, lastActive: "1 day ago", tag: "VIP" },
  { id: "chidi-okafor", name: "Chidi Okafor", initials: "CO", phone: "+234 814 119 7720", email: "chidi.okafor@gmail.com", totalSpent: 12400, orders: 1, lastActive: "9 days ago", tag: null },
  { id: "damilola-ade", name: "Damilola Ade", initials: "DA", phone: "+234 902 556 4412", email: "dami.ade@gmail.com", totalSpent: 34750, orders: 2, lastActive: "4 days ago", tag: "New" },
  { id: "emeka-nwosu", name: "Emeka Nwosu", initials: "EN", phone: "+234 806 771 9043", email: "emeka.nwosu@gmail.com", totalSpent: 19200, orders: 1, lastActive: "12 days ago", tag: null },
  { id: "fadekemi-onasanya", name: "Fadekemi Onasanya", initials: "FO", phone: "+234 705 330 8856", email: "fade.ona@gmail.com", totalSpent: 73000, orders: 4, lastActive: "6 days ago", tag: "VIP" },
  { id: "goke-williams", name: "Goke Williams", initials: "GW", phone: "+234 813 447 2098", email: "goke.w@gmail.com", totalSpent: 0, orders: 0, lastActive: "Never", tag: "Lead" },
  { id: "habiba-musa", name: "Habiba Musa", initials: "HM", phone: "+234 908 612 3345", email: "habiba.musa@gmail.com", totalSpent: 46500, orders: 3, lastActive: "2 days ago", tag: null },
];

export const getCustomer = (id: string) => CUSTOMERS.find((c) => c.id === id);

// ---- Profile detail (Customer Details screen) -----------------------------

export type OrderStage = "Completed" | "In Progress" | "Pending";

export type OrderHistoryItem = {
  id: string;
  service: string;
  amount: number;
  stage: OrderStage;
  date: string;
};

export type PaymentItem = {
  label: string;
  method: string;
  date: string;
  amount: number;
  icon: "receipt" | "card";
};

export type Measurements = {
  bust: string;
  waist: string;
  hip: string;
  shoulder: string;
  sleeve: string;
  height: string;
};

export const stageTone: Record<OrderStage, "success" | "warning" | "info"> = {
  Completed: "success",
  "In Progress": "warning",
  Pending: "info",
};

export const SAMPLE_MEASUREMENTS: Measurements = {
  bust: "36 in",
  waist: "30 in",
  hip: "42 in",
  shoulder: "15.5 in",
  sleeve: "24 in",
  height: "5'8\"",
};

const SAMPLE_ORDERS: OrderHistoryItem[] = [
  { id: "ORD-0891", service: "Ankara Suit (Custom)", amount: 45000, stage: "Completed", date: "Oct 12, 2023" },
  { id: "ORD-0722", service: "Silk Evening Gown", amount: 32000, stage: "In Progress", date: "Sep 28, 2023" },
  { id: "ORD-0651", service: "Corporate Blouse", amount: 12000, stage: "Completed", date: "Sep 15, 2023" },
  { id: "ORD-0511", service: "Casual Linen Set", amount: 16000, stage: "Completed", date: "Aug 30, 2023" },
  { id: "ORD-0480", service: "Bridal Gele Set", amount: 28000, stage: "Completed", date: "Aug 02, 2023" },
];

const SAMPLE_PAYMENTS: PaymentItem[] = [
  { label: "Deposit for Ankara Suit", method: "Bank Transfer", date: "Oct 12, 2023", amount: 25000, icon: "receipt" },
  { label: "Full Payment: Silk Gown", method: "POS", date: "Sep 28, 2023", amount: 32000, icon: "card" },
];

export const orderHistoryFor = (c: Customer) => SAMPLE_ORDERS.slice(0, c.orders);
export const paymentsFor = (c: Customer) => (c.orders > 0 ? SAMPLE_PAYMENTS : []);
export const avgOrderValue = (c: Customer) =>
  c.orders > 0 ? Math.round(c.totalSpent / c.orders) : 0;
