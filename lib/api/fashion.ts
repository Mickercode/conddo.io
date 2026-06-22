// Fashion module — typed API surface. Endpoints: /api/v1/fashion/products, /api/v1/fashion/orders
import { api } from "./client";

export type FashionProduct = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  material: string;
  basePrice: number;
  totalStock: number;
  active: boolean;
  variants: Variant[];
  hasLowStock: boolean;
};

export type Variant = {
  size: string;
  color: string;
  stock: number;
};

export type FashionProductListParams = {
  search?: string;
  category?: string;
  material?: string;
  lowStockOnly?: boolean;
  page?: number;
  size?: number;
};

export type CreateFashionProductInput = {
  name: string;
  sku?: string;
  category: string;
  material: string;
  basePrice: number;
  variants?: Variant[];
  active?: boolean;
};

export type UpdateFashionProductInput = Partial<CreateFashionProductInput>;

export type AdjustVariantInput = {
  size: string;
  color: string;
  delta: number;
};

export const fashionProductApi = {
  list: (p: FashionProductListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.search) qs.set("search", p.search);
    if (p.category) qs.set("category", p.category);
    if (p.material) qs.set("material", p.material);
    if (p.lowStockOnly) qs.set("lowStockOnly", "true");
    qs.set("page", String(p.page ?? 0));
    qs.set("size", String(p.size ?? 20));
    return api.get<FashionProduct[]>(`/fashion/products?${qs.toString()}`);
  },
  get: (id: string) => api.get<FashionProduct>(`/fashion/products/${id}`),
  lowStock: () => api.get<FashionProduct[]>("/fashion/products/low-stock"),
  create: (body: CreateFashionProductInput) => api.post<FashionProduct>("/fashion/products", body),
  update: (id: string, body: UpdateFashionProductInput) => api.patch<FashionProduct>(`/fashion/products/${id}`, body),
  remove: (id: string) => api.del<void>(`/fashion/products/${id}`),
  adjustVariant: (id: string, body: AdjustVariantInput) =>
    api.post<FashionProduct>(`/fashion/products/${id}/adjust-variant`, body),
};

export type FashionOrder = {
  id: string;
  reference: string;
  customerId: string | null;
  customerName: string;
  stage: string;
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string | null;
  notes: string | null;
  flag: string | null;
  items: FashionOrderItem[];
};

export type FashionOrderItem = {
  shoeId: string;
  shoeName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type FashionOrderListParams = {
  search?: string;
  stage?: string;
  page?: number;
  size?: number;
};

export type CreateFashionOrderInput = {
  reference: string;
  customerId?: string;
  customerName: string;
  stage: string;
  items?: FashionOrderItem[];
};

export type UpdateFashionOrderInput = {
  stage?: string;
  expectedDelivery?: string;
  notes?: string;
  flag?: string;
};

export const fashionOrderApi = {
  list: (p: FashionOrderListParams = {}) => {
    const qs = new URLSearchParams();
    if (p.search) qs.set("search", p.search);
    if (p.stage) qs.set("stage", p.stage);
    qs.set("page", String(p.page ?? 0));
    qs.set("size", String(p.size ?? 20));
    return api.get<FashionOrder[]>(`/fashion/orders?${qs.toString()}`);
  },
  get: (id: string) => api.get<FashionOrder>(`/fashion/orders/${id}`),
  create: (body: CreateFashionOrderInput) => api.post<FashionOrder>("/fashion/orders", body),
  update: (id: string, body: UpdateFashionOrderInput) => api.patch<FashionOrder>(`/fashion/orders/${id}`, body),
  remove: (id: string) => api.del<void>(`/fashion/orders/${id}`),
};
