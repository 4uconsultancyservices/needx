export interface GeoPoint {
  type: 'Point';
  /** [longitude, latitude] — GeoJSON order, matches MongoDB 2dsphere. */
  coordinates: [number, number];
}

export interface LocationInfo {
  point: GeoPoint;
  /** Human label, e.g. "Sector 29, Gurgaon". Approximate on purpose pre-transaction. */
  label: string;
  city?: string;
  state?: string;
  /** Precise address only ever populated once an order requires it. */
  precise?: boolean;
}

export interface Budget {
  min?: number;
  max?: number;
  currency: string; // ISO 4217, e.g. "INR"
}

export interface DateRange {
  start?: string; // ISO date
  end?: string; // ISO date
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: {
    total?: number;
    page?: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string | null;
  };
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

/** Base fields every persisted document exposes over the wire. */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
