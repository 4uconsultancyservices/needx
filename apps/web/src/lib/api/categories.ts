import { api } from '../api-client';
import type { Category, CategoryAttributeDef } from '@needx/types';
import type { CreateCategoryInput, UpdateCategoryInput } from '@needx/validation';

export interface CategoryAdminRecord extends Category {
  parentCategory: { id: string; name: string; slug: string; icon?: string } | null;
  demandsCount: number;
  activeDemandsCount: number;
  avgDemandBudget: number;
  inventoryCount: number;
  activeInventoryCount: number;
  providerCount: number;
  avgListingPrice: number;
  subcategoriesCount: number;
  marketHealth: 'UNDER_SUPPLIED' | 'HIGH_DEMAND' | 'BALANCED' | 'OVER_SUPPLIED' | 'UNTESTED';
}

export interface CategoryExplorerData {
  category: Category;
  parentCategory: { id: string; name: string; slug: string; icon?: string } | null;
  subcategories: Array<{ id: string; name: string; slug: string; icon?: string; isActive: boolean }>;
  stats: {
    totalNeeds: number;
    activeNeeds: number;
    totalListings: number;
    activeListings: number;
    providerCount: number;
    marketHealth: 'UNDER_SUPPLIED' | 'HIGH_DEMAND' | 'BALANCED' | 'OVER_SUPPLIED' | 'UNTESTED';
  };
  recentNeeds: Array<{
    id: string;
    title: string;
    status: string;
    budget?: { min?: number; max?: number; currency?: string };
    location?: { city?: string };
    createdAt?: string;
    user?: { name: string; email: string; city?: string } | null;
  }>;
  recentListings: Array<{
    id: string;
    title: string;
    basePrice: number;
    pricingMode: string;
    status: string;
    ratingAverage: number;
    createdAt?: string;
    provider?: {
      name: string;
      businessName?: string;
      ratingAverage: number;
      city?: string;
    } | null;
  }>;
}

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  bySlug: (slug: string) => api.get<Category>(`/categories/${slug}`),
  adminOverview: () => api.get<CategoryAdminRecord[]>('/categories/admin/overview'),
  adminExplorer: (id: string) => api.get<CategoryExplorerData>(`/categories/admin/${id}/explorer`),
  create: (data: CreateCategoryInput) => api.post<Category>('/categories', data),
  update: (id: string, data: UpdateCategoryInput) => api.patch<Category>(`/categories/${id}`, data),
  bulkSetStatus: (ids: string[], isActive: boolean) =>
    api.post<{ modifiedCount: number }>('/categories/admin/bulk-status', { ids, isActive }),
  delete: (id: string) => api.delete<{ action: string; message: string }>(`/categories/${id}`),
};
