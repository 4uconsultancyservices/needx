'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type ListResponse } from '../lib/api-client';
import type { Listing, Need, Order, PublicUser, Role, TrustInfo } from '@needx/types';

export interface AdminUserRecord extends PublicUser {
  email?: string;
  phone?: string;
  isBanned?: boolean;
  bannedReason?: string;
}

export interface AdminUserDossier {
  user: AdminUserRecord;
  needs: Need[];
  listings: Listing[];
  buyerOrders: Order[];
  providerOrders: Order[];
  stats: {
    totalNeeds: number;
    totalListings: number;
    totalBuyerOrders: number;
    totalProviderOrders: number;
  };
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalProviders: number;
  activeNeeds: number;
  totalNeeds: number;
  activeListings: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  gmv: number;
  platformRevenue: number;
  openDisputes: number;
  openReports: number;
  needFulfillmentRate: number;
  cancellationRate: number;
  conversionRate: number;
}

export function useAdminDashboard() {
  return useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => api.get<AdminDashboardStats>('/admin/dashboard') });
}

export function useAdminSignups(days = 14) {
  return useQuery({
    queryKey: ['admin', 'signups', days],
    queryFn: () => api.get<Array<{ date: string; count: number }>>('/admin/dashboard/signups', { days }),
  });
}

export function useAdminUsers(params: { page?: number; limit?: number; q?: string }) {
  return useQuery({ queryKey: ['admin', 'users', params], queryFn: () => api.get<ListResponse<AdminUserRecord>>('/admin/users', params) });
}

export function useAdminUserDossier(id?: string | null) {
  return useQuery({
    queryKey: ['admin', 'users', id, 'dossier'],
    queryFn: () => api.get<AdminUserDossier>(`/admin/users/${id}/dossier`),
    enabled: Boolean(id),
  });
}

export function useAdminUpdateUserTrust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, flags }: { id: string; flags: Partial<TrustInfo> }) =>
      api.patch<AdminUserRecord>(`/admin/users/${id}/trust`, flags),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', variables.id, 'dossier'] });
    },
  });
}

export function useAdminNeeds(params: { page?: number; limit?: number }) {
  return useQuery({ queryKey: ['admin', 'needs', params], queryFn: () => api.get<ListResponse<Need>>('/admin/needs', params) });
}

export function useAdminListings(params: { page?: number; limit?: number }) {
  return useQuery({ queryKey: ['admin', 'listings', params], queryFn: () => api.get<ListResponse<Listing>>('/admin/listings', params) });
}

export function useAdminOrders(params: { page?: number; limit?: number; status?: string }) {
  return useQuery({ queryKey: ['admin', 'orders', params], queryFn: () => api.get<ListResponse<Order>>('/admin/orders', params) });
}

export function useBanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => api.patch(`/admin/users/${id}/ban`, { reason }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', variables.id, 'dossier'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useUnbanUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/users/${id}/unban`),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', id, 'dossier'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
}

export function useSetUserRoles() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roles }: { id: string; roles: Role[] }) => api.patch(`/admin/users/${id}/roles`, { roles }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', variables.id, 'dossier'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useAdminToggleProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      isProvider,
      businessName,
      providerType,
    }: {
      id: string;
      isProvider: boolean;
      businessName?: string;
      providerType?: string;
    }) => api.patch<AdminUserRecord>(`/admin/users/${id}/provider`, { isProvider, businessName, providerType }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      qc.invalidateQueries({ queryKey: ['admin', 'users', variables.id, 'dossier'] });
      qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['me'] });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useAdminArchiveListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/admin/listings/${id}/archive`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'listings'] }),
  });
}

export function useAdminReports(params: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'reports', params],
    queryFn: () => api.get<{ items: Array<Record<string, unknown>>; total: number }>('/reports', params),
  });
}

export function useResolveReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, note }: { id: string; action: 'resolve' | 'reject'; note?: string }) =>
      api.patch(`/reports/${id}/${action}`, { note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'reports'] }),
  });
}

export function useAdminDisputes(params: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'disputes', params],
    queryFn: () => api.get<{ items: Array<Record<string, unknown>>; total: number }>('/disputes', params),
  });
}

export function useResolveDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, resolutionNote }: { id: string; status: string; resolutionNote: string }) =>
      api.patch(`/disputes/${id}/resolve`, { status, resolutionNote }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'disputes'] }),
  });
}

export function useAdminAuditLog(params: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['admin', 'audit-log', params],
    queryFn: () => api.get<{ items: Array<Record<string, unknown>>; total: number }>('/admin/audit-log', params),
  });
}
