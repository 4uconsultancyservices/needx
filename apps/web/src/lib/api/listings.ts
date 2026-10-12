import { api, type ListResponse } from '../api-client';
import type { Listing } from '@needx/types';
import type { CreateListingInput, ListingSearchQuery, UpdateListingInput } from '@needx/validation';

export const listingsApi = {
  create: (input: CreateListingInput) => api.post<Listing>('/listings', input),
  byId: (id: string) => api.get<Listing>(`/listings/${id}`),
  mine: (params?: { page?: number; limit?: number; status?: string }) => api.get<ListResponse<Listing>>('/listings/mine', params),
  search: (params?: Partial<ListingSearchQuery>) => api.get<ListResponse<Listing>>('/listings', params as Record<string, string>),
  update: (id: string, input: UpdateListingInput) => api.patch<Listing>(`/listings/${id}`, input),
  pause: (id: string) => api.patch<Listing>(`/listings/${id}/pause`),
  activate: (id: string) => api.patch<Listing>(`/listings/${id}/activate`),
  archive: (id: string) => api.patch<Listing>(`/listings/${id}/archive`),
  matchingNeeds: (id: string) => api.get<Array<{ needId: string; score: number }>>(`/listings/${id}/matching-needs`),
};
