'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CustomerProfile } from '@needx/types';
import type {
  AdminUpdateCustomerProfileInput,
  UpdateCustomerPreferencesInput,
} from '@needx/validation';

export function useMyCustomerProfile() {
  return useQuery({
    queryKey: ['users', 'me', 'customer-profile'],
    queryFn: () => api.get<CustomerProfile>('/users/me/customer-profile'),
  });
}

export function useUpdateMyCustomerPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateCustomerPreferencesInput) =>
      api.patch<CustomerProfile>('/users/me/customer-profile', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users', 'me', 'customer-profile'] });
    },
  });
}

export function useCustomerProfileForAdmin(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'customers', userId],
    queryFn: () => api.get<CustomerProfile>(`/users/${userId}/customer-profile`),
    enabled: Boolean(userId),
  });
}

export function useAdminUpdateCustomerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: AdminUpdateCustomerProfileInput }) =>
      api.patch<CustomerProfile>(`/users/${userId}/customer-profile`, input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'customers', variables.userId] });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
