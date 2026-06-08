// Media uploads — typed API surface. BE shape is MediaService.MediaView
// (backend/conddo-core/.../MediaService.java) since the Phase 2a shipment
// (commit d0c9e07 — dimensions, uploaded_by, video uploads, per-plan cap).
//
// Endpoints:
//   POST /api/v1/media        (multipart) → MediaView (201)
//   GET  /api/v1/media         → MediaView[] + pagination meta
//   GET  /api/v1/media/usage   → Usage     (usedBytes / capBytes; -1 = unlimited)
//   DELETE /api/v1/media/{id}  → 204

import { api, uploadFile } from "./client";

/** Server-shaped media row. Pre-Phase-2a uploads have null width/height
 *  /uploadedBy — kept optional so legacy rows render unchanged. */
export type UploadedMedia = {
  id: string;
  url: string;
  contentType?: string;
  size?: number;
  originalName?: string;
  kind?: "image" | "video";
  width?: number | null;
  height?: number | null;
  uploadedBy?: string | null;
  createdAt?: string;
};

/** Plan-scoped storage cap. capBytes = -1 means the plan has no cap. */
export type MediaUsage = {
  usedBytes: number;
  capBytes: number;
};

export const mediaApi = {
  upload: (file: File, purpose?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (purpose) form.append("purpose", purpose);
    return uploadFile<UploadedMedia>("/media", form);
  },
  list: (params: { kind?: "image" | "video"; page?: number; size?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.kind) qs.set("kind", params.kind);
    qs.set("page", String(params.page ?? 0));
    qs.set("size", String(params.size ?? 20));
    return api.get<UploadedMedia[]>(`/media?${qs.toString()}`);
  },
  usage:  () => api.get<MediaUsage>("/media/usage"),
  remove: (id: string) => api.del<void>(`/media/${id}`),
};

/** "Used 2.3 GB of 5 GB" style label, with the unlimited case handled. */
export function fmtMediaUsage(u: MediaUsage): string {
  const mb = (n: number) => `${(n / (1024 * 1024)).toFixed(1)} MB`;
  const gb = (n: number) => `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  const formatSize = (n: number) => (n >= 1024 * 1024 * 1024 ? gb(n) : mb(n));
  if (u.capBytes < 0) return `${formatSize(u.usedBytes)} used`;
  return `${formatSize(u.usedBytes)} of ${formatSize(u.capBytes)}`;
}
