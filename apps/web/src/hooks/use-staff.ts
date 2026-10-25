'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type ListResponse } from '@/lib/api-client';
import type {
  Role,
  StaffDepartment,
  StaffModule,
  StaffProfile,
  StaffUserRecord,
} from '@needx/types';
import type { CreateStaffInput, CreateStaffUserInput, UpdateStaffInput } from '@needx/validation';

export interface MyStaffProfileResponse {
  isStaff: boolean;
  isSuperAdmin: boolean;
  department?: StaffDepartment;
  designation?: string;
  role?: Role;
  permissions: string[];
  assignedQueues?: string[];
  isSuspended?: boolean;
}

export interface PermissionsCatalogResponse {
  modules: StaffModule[];
  departments: StaffDepartment[];
  rolePresets: Record<string, string[]>;
  actions: string[];
}

export function useMyStaffProfile() {
  return useQuery({
    queryKey: ['admin', 'staff', 'me'],
    queryFn: () => api.get<MyStaffProfileResponse>('/admin/staff/me'),
    staleTime: 60_000,
  });
}

export function useStaffList(params?: {
  page?: number;
  limit?: number;
  q?: string;
  department?: StaffDepartment;
}) {
  return useQuery({
    queryKey: ['admin', 'staff', 'list', params],
    queryFn: () =>
      api.get<ListResponse<StaffUserRecord>>(
        '/admin/staff',
        params as Record<string, string | number | boolean | undefined>,
      ),
  });
}

export function useStaffPermissionsCatalog() {
  return useQuery({
    queryKey: ['admin', 'staff', 'catalog'],
    queryFn: () => api.get<PermissionsCatalogResponse>('/admin/staff/permissions-catalog'),
    staleTime: 5 * 60_000,
  });
}

export function useStaffMember(userId: string | null) {
  return useQuery({
    queryKey: ['admin', 'staff', 'member', userId],
    queryFn: () => api.get<StaffProfile>(`/admin/staff/${userId}`),
    enabled: Boolean(userId),
  });
}

export function useAssignStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStaffInput) => api.post<StaffProfile>('/admin/staff', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'staff'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useCreateStaffUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStaffUserInput) =>
      api.post<StaffUserRecord>('/admin/staff/create-user', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'staff'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateStaffInput }) =>
      api.patch<StaffProfile>(`/admin/staff/${userId}`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'staff'] });
    },
  });
}

export function useRevokeStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.delete<{ revoked: boolean }>(`/admin/staff/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'staff'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}
