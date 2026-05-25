// Demo order data — shared by the Orders pipeline (Kanban) and Order Detail.

export type Flag = "OVERDUE" | "URGENT";

export type OrderStage =
  | "Received"
  | "Measurement Taken"
  | "Fabric Sourced"
  | "In Production"
  | "Ready for Fitting"
  | "Delivered";

export type Order = {
  id: string; // e.g. "ORD-2894"
  customer: string;
  service: string;
  amount: number;
  date: string; // short label, e.g. "Oct 24"
  initials: string;
  stage: OrderStage;
  flag?: Flag;
};

// Pipeline order + the count badge shown on each column header.
export const STAGES: OrderStage[] = [
  "Received",
  "Measurement Taken",
  "Fabric Sourced",
  "In Production",
  "Ready for Fitting",
  "Delivered",
];

export const STAGE_COUNTS: Record<OrderStage, number> = {
  Received: 2,
  "Measurement Taken": 3,
  "Fabric Sourced": 4,
  "In Production": 5,
  "Ready for Fitting": 2,
  Delivered: 8,
};

// Step label shown in the Order Detail progress stepper.
export const STAGE_STEP_LABEL: Record<OrderStage, string> = {
  Received: "Received",
  "Measurement Taken": "Measurement",
  "Fabric Sourced": "Fabric Sourced",
  "In Production": "In Production",
  "Ready for Fitting": "Ready for Fitting",
  Delivered: "Delivered",
};

export const stageTone: Record<OrderStage, "info" | "warning" | "primary" | "success"> = {
  Received: "info",
  "Measurement Taken": "info",
  "Fabric Sourced": "info",
  "In Production": "warning",
  "Ready for Fitting": "primary",
  Delivered: "success",
};

export const ORDERS: Order[] = [
  { id: "ORD-2894", customer: "Chidi Benson", service: "Ankara Two-Piece", amount: 45000, date: "Oct 24", initials: "CB", stage: "Received" },
  { id: "ORD-2901", customer: "Amaka Okafor", service: "Wedding Gown Alteration", amount: 120000, date: "Oct 26", initials: "AO", stage: "Received" },
  { id: "ORD-2870", customer: "Tunde Folawiyo", service: "Senator Suit (White)", amount: 85000, date: "Oct 18", initials: "TF", stage: "Measurement Taken", flag: "OVERDUE" },
  { id: "ORD-2882", customer: "Yemi Alade", service: "Lace Blouse", amount: 60000, date: "Oct 25", initials: "YA", stage: "Measurement Taken" },
  { id: "ORD-2810", customer: "Bolu Johnson", service: "Cotton Shirt", amount: 25000, date: "Oct 22", initials: "BJ", stage: "Fabric Sourced" },
  { id: "ORD-2799", customer: "Omoni Oboli", service: "Agbada Premium Set", amount: 150000, date: "Oct 19", initials: "OO", stage: "In Production", flag: "URGENT" },
  { id: "ORD-2755", customer: "Ken Ogbu", service: "Safari Suit", amount: 45000, date: "Oct 28", initials: "KO", stage: "Ready for Fitting" },
];

export const ordersByStage = (stage: OrderStage) => ORDERS.filter((o) => o.stage === stage);

export const getOrder = (id: string) => ORDERS.find((o) => o.id.toLowerCase() === id.toLowerCase());
