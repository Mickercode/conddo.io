// Notifications module — typed API surface. Endpoint: ACTION_LIST §11.12.
import { api } from "./client";

export type NotificationType = "order" | "payment" | "booking" | "customer" | "system";
export type Notification = {
  id: string;
  type?: NotificationType;
  title: string;
  body?: string;
  time?: string;
  createdAt?: string;
  read: boolean;
};
export type NotificationsResponse = { items: Notification[]; unread: number };

export const notificationsApi = {
  list: () => api.get<NotificationsResponse>("/notifications"),
  markAllRead: () => api.post("/notifications/read-all"),
};
