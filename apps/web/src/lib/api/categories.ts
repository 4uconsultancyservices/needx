import { api } from '../api-client';
import type { Category } from '@needx/types';

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  bySlug: (slug: string) => api.get<Category>(`/categories/${slug}`),
};
