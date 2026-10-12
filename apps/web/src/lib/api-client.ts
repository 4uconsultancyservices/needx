import type { ApiErrorBody, ApiResponse } from '@needx/types';

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const base = path.startsWith('/api/v1') ? path : `/api/v1${path}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

/**
 * The one fetch wrapper every hook/service in the app goes through. Talks to
 * same-origin `/api/v1/*`, which next.config.ts rewrites to the NestJS API —
 * this keeps auth cookies simple (no cross-origin cookie dance) and means
 * this file needs zero knowledge of the API's real origin.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}, _retried = false): Promise<T> {
  const res = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    credentials: 'include',
    signal: options.signal,
    headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // A single, transparent retry-after-refresh — most of the app never has to
  // think about token expiry at all.
  if (res.status === 401 && !_retried && path !== '/auth/refresh' && path !== '/auth/login') {
    const refreshed = await tryRefresh();
    if (refreshed) return apiFetch<T>(path, options, true);
  }

  const json = (await res.json().catch(() => null)) as (ApiResponse<T> & { meta?: unknown }) | null;

  if (!res.ok || !json || json.success === false) {
    const err = (json as ApiErrorBody | null)?.error;
    throw new ApiError(err?.code ?? 'UNKNOWN_ERROR', err?.message ?? `Request failed (${res.status})`, res.status, err?.fields);
  }

  if (json.meta !== undefined) {
    return { data: json.data, meta: json.meta } as unknown as T;
  }

  return json.data;
}

export interface ListResponse<T> {
  data: T[];
  meta: { total?: number; page?: number; limit: number; hasMore: boolean; unreadCount?: number };
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query'], signal?: AbortSignal) =>
    apiFetch<T>(path, { method: 'GET', query, signal }),
  post: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'DELETE', body }),
};
