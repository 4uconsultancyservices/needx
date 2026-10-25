'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  categoriesApi,
  type CategoryAdminRecord,
  type CategoryExplorerData,
} from '../lib/api/categories';
import type { CreateCategoryInput, UpdateCategoryInput } from '@needx/validation';

export type { CategoryAdminRecord, CategoryExplorerData };

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.list,
    staleTime: 5 * 60_000,
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['categories', slug],
    queryFn: () => categoriesApi.bySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useCategoryAdminOverview() {
  return useQuery({
    queryKey: ['admin', 'categories', 'overview'],
    queryFn: categoriesApi.adminOverview,
    staleTime: 30_000,
  });
}

export function useCategoryExplorer(id?: string | null) {
  return useQuery({
    queryKey: ['admin', 'categories', id, 'explorer'],
    queryFn: () => categoriesApi.adminExplorer(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCategoryInput) => categoriesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      categoriesApi.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'categories', variables.id, 'explorer'] });
    },
  });
}

export function useBulkSetCategoryStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, isActive }: { ids: string[]; isActive: boolean }) =>
      categoriesApi.bulkSetStatus(ids, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}
