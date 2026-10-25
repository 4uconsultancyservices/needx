'use client';

import { useQuery } from '@tanstack/react-query';
import { api, type ListResponse } from '@/lib/api-client';
import type { PublicUser } from '@needx/types';

export interface PublicProvidersParams {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  limit?: number;
  q?: string;
  city?: string;
  category?: string;
  minRating?: number;
  verifiedOnly?: boolean;
  sort?: 'rating' | 'newest' | 'transactions';
}

export function usePublicProviders(params?: PublicProvidersParams) {
  return useQuery({
    queryKey: ['providers', 'public', params],
    queryFn: () => api.get<ListResponse<PublicUser>>('/users/public/providers', params),
  });
}

export function usePublicUser(id: string) {
  const isValid = /^[a-fA-F0-9]{24}$/.test(id);
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.get<PublicUser>(`/users/${id}`),
    enabled: isValid && !!id,
  });
}
