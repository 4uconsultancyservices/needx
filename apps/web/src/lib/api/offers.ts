import { api, type ListResponse } from '../api-client';
import type { Offer } from '@needx/types';
import type { CounterOfferInput, CreateOfferInput } from '@needx/validation';

export const offersApi = {
  create: (input: CreateOfferInput) => api.post<Offer>('/offers', input),
  byId: (id: string) => api.get<Offer>(`/offers/${id}`),
  forNeed: (needId: string) => api.get<Offer[]>(`/offers/for-need/${needId}`),
  mine: (params?: { page?: number; limit?: number; status?: string }) => api.get<ListResponse<Offer>>('/offers/mine', params),
  view: (id: string) => api.patch<Offer>(`/offers/${id}/view`),
  counter: (id: string, input: CounterOfferInput) => api.patch<Offer>(`/offers/${id}/counter`, input),
  accept: (id: string) => api.patch<Offer>(`/offers/${id}/accept`),
  reject: (id: string, message?: string) => api.patch<Offer>(`/offers/${id}/reject`, { message }),
  cancel: (id: string) => api.patch<Offer>(`/offers/${id}/cancel`),
};
