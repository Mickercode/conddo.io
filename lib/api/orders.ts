// Orders module — typed API surface. Endpoints: ACTION_LIST §11.4.
import { api } from "./client";

export type Flag = "OVERDUE" | "URGENT";

export type Order = {
  id: string;
  reference?: string;
  customer: string;
  service?: string;
  amount: number;
  date?: string;
  initials?: string;
  stage?: string;
  flag?: Flag | null;
};

export type BoardStage = { name: string; count: number; orders: Order[] };
export type Board = { stages: BoardStage[] };

// GET /orders/{id} — full detail.
export type OrderItem = { id?: string; description?: string; name?: string; quantity?: number; unitPrice?: number; total?: number };
export type OrderPayment = { id?: string; label?: string; method?: string; date?: string; amount: number };
export type OrderActivity = { id: string; type?: string; title: string; detail?: string; actor?: string | null; at: string };
export type OrderCustomerRef = { id?: string; name?: string; phone?: string; email?: string };
export type OrderDetail = {
  id: string;
  reference: string;
  service: string | null;
  stage: string;
  stages: string[];
  flag: Flag | null;
  dueDate: string | null;
  orderedAt: string;
  amount: number;
  billing: { total: number; deposit: number; balance: number };
  customer: OrderCustomerRef | string | null;
  items: OrderItem[];
  payments: OrderPayment[];
  measurements: Record<string, string | number> | null;
  notes: string | null;
  activity: OrderActivity[];
};

// Pipeline stage (GET /orders/stages). `id` is null for an unmaterialised default.
export type Stage = { id: string | null; name: string; position: number };

// Write payloads (backend CreateOrderRequest / UpdateOrderRequest, §11.4).
export type NewOrderItem = { description: string; quantity?: number; unitPrice?: number };
export type CreateOrderInput = {
  customerId?: string;
  customerName?: string;
  service?: string;
  stage?: string;
  amount?: number;
  dueDate?: string; // YYYY-MM-DD
  items?: NewOrderItem[];
  measurements?: Record<string, string | number>;
  notes?: string;
};
export type UpdateOrderInput = {
  service?: string;
  dueDate?: string;
  flag?: Flag | null;
  amount?: number;
  notes?: string;
};

export type StageWriteInput = { name?: string; position?: number };

// Line-item CRUD payloads — backend OrderController items endpoints.
// Create requires `description`; quantity defaults to 1, unitPrice defaults
// to 0 server-side when omitted. PATCH carries only the changed fields.
export type CreateOrderItemInput = {
  description: string;
  quantity?: number;
  unitPrice?: number;
};
export type UpdateOrderItemInput = Partial<CreateOrderItemInput>;

export const ordersApi = {
  board: () => api.get<Board>("/orders/board"),
  listRecent: (size = 4) => api.get<Order[]>(`/orders?size=${size}`),
  list: (qs = "") => api.get<Order[]>(`/orders${qs ? `?${qs}` : ""}`),
  get: (id: string) => api.get<OrderDetail>(`/orders/${id}`),

  // Pipeline stage management (backend OrderStageController, §11.4).
  // A tenant with no overrides sees its vertical's default stages; the first
  // create/update materialises those defaults so they can be renamed / reordered
  // / deleted — invisible to the FE, which always reads from /orders/stages.
  stages: () => api.get<Stage[]>("/orders/stages"),
  createStage: (body: StageWriteInput & { name: string }) =>
    api.post<Stage>("/orders/stages", body),
  updateStage: (id: string, body: StageWriteInput) =>
    api.patch<Stage>(`/orders/stages/${id}`, body),
  deleteStage: (id: string) => api.del<void>(`/orders/stages/${id}`),

  create: (body: CreateOrderInput) => api.post<OrderDetail>("/orders", body),
  update: (id: string, body: UpdateOrderInput) => api.patch<OrderDetail>(`/orders/${id}`, body),
  transition: (id: string, stage: string) => api.post<OrderDetail>(`/orders/${id}/transition`, { stage }),
  addPayment: (id: string, body: { amount: number; method?: string; note?: string }) =>
    api.post<OrderPayment>(`/orders/${id}/payments`, body),
  setMeasurements: (id: string, measurements: Record<string, string | number>) =>
    api.put<{ measurements: Record<string, string | number> | null }>(`/orders/${id}/measurements`, { measurements }),
  remind: (id: string, message?: string) => api.post<void>(`/orders/${id}/reminders`, message ? { message } : undefined),

  // Line items — order detail GET already nests `items`, but the
  // dedicated CRUD endpoints let the FE add/edit/remove a line without
  // re-fetching the whole order. PATCH/DELETE return the affected row
  // (or 204) so the FE only updates that row in state.
  listItems: (id: string) => api.get<OrderItem[]>(`/orders/${id}/items`),
  addItem: (id: string, body: CreateOrderItemInput) =>
    api.post<OrderItem>(`/orders/${id}/items`, body),
  updateItem: (id: string, itemId: string, body: UpdateOrderItemInput) =>
    api.patch<OrderItem>(`/orders/${id}/items/${itemId}`, body),
  removeItem: (id: string, itemId: string) =>
    api.del<void>(`/orders/${id}/items/${itemId}`),

  /** Paginated activity feed for long-running orders. The detail GET nests
   *  the first page; this is for explicit "Load more". */
  activity: (id: string) => api.get<OrderActivity[]>(`/orders/${id}/activity`),
};
