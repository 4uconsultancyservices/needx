'use client';

import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../lib/api/categories';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: categoriesApi.list, staleTime: 5 * 60_000 });
}

export function useCategory(slug: string) {
  return useQuery({ queryKey: ['categories', slug], queryFn: () => categoriesApi.bySlug(slug), enabled: !!slug });
}
