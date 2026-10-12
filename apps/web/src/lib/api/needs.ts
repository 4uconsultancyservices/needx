import { api, type ListResponse } from '../api-client';
import type { ListingMatch, Need, ParsedNeedPreview } from '@needx/types';
import type { CreateNeedInput, ParseNeedInput, UpdateNeedInput } from '@needx/validation';

export const needsApi = {
  parse: (input: ParseNeedInput) => api.post<ParsedNeedPreview>('/needs/parse', input),
  create: (input: CreateNeedInput) => api.post<Need>('/needs', input),
  byId: (id: string) => api.get<Need>(`/needs/${id}`),
  matches: (id: string) => api.get<ListingMatch[]>(`/needs/${id}/matches`),
  mine: (params?: { page?: number; status?: string }) => api.get<ListResponse<Need>>('/needs/mine', params),
  search: (params?: { q?: string; categoryId?: string; city?: string; page?: number }) => api.get<ListResponse<Need>>('/needs', params),
  update: (id: string, input: UpdateNeedInput) => api.patch<Need>(`/needs/${id}`, input),
  cancel: (id: string) => api.delete<Need>(`/needs/${id}`),
};
