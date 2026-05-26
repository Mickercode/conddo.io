// Media uploads — typed API surface (Architecture §11.12, MinIO-backed).
// Tenant-scoped; returns a publicly-servable URL to store as e.g. branding.logoUrl.
//
// BACKEND CONTRACT (to implement):
//   POST /api/v1/media   (multipart/form-data)
//     field `file`     — required, the binary
//     field `purpose`  — optional, e.g. "logo" | "website" | "product"
//     auth: JWT (tenant from token); store under the tenant's MinIO prefix
//   → { success, data: { url, id?, contentType?, size? } }   (201)
//   `url` must be publicly fetchable (public bucket or a proxy/CDN), since it's
//   embedded in the dashboard, the public website, and emails.
import { uploadFile } from "./client";

export type UploadedMedia = {
  url: string;
  id?: string;
  contentType?: string;
  size?: number;
};

export const mediaApi = {
  upload: (file: File, purpose?: string) => {
    const form = new FormData();
    form.append("file", file);
    if (purpose) form.append("purpose", purpose);
    return uploadFile<UploadedMedia>("/media", form);
  },
};
