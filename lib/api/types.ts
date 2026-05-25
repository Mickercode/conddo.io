// Shared API types — mirror the backend's standard envelope (ACTION_LIST §6, §13.2).

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiMeta = {
  page?: number;
  size?: number;
  total?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: ApiMeta;
  error?: ApiErrorBody;
};

export type Result<T> = { data: T; meta?: ApiMeta };
