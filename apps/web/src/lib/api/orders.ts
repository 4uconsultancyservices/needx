import { api, type ListResponse } from '../api-client';
import type { Order } from '@needx/types';

export const ordersApi = {
  create: (offerId: string) => api.post<Order>('/orders', { offerId }),
  byId: (id: string) => api.get<Order>(`/orders/${id}`),
  mine: (params?: { page?: number; limit?: number; status?: string }) => api.get<ListResponse<Order>>('/orders/mine', params),
  providerMine: (params?: { page?: number; limit?: number; status?: string }) => api.get<ListResponse<Order>>('/orders/provider-mine', params),
  confirm: (id: string) => api.patch<Order>(`/orders/${id}/confirm`),
  ready: (id: string) => api.patch<Order>(`/orders/${id}/ready`),
  start: (id: string) => api.patch<Order>(`/orders/${id}/start`),
  complete: (id: string) => api.patch<Order>(`/orders/${id}/complete`),
  cancel: (id: string, reason?: string) => api.patch<Order>(`/orders/${id}/cancel`, { reason }),
};

export const paymentsApi = {
  checkout: (orderId: string) => api.post<{ paymentId: string; checkoutUrl?: string }>('/payments/checkout', { orderId }),
};

export const rentalsApi = {
  create: (orderId: string, startDate?: string, endDate?: string) =>
    api.post('/rentals', { orderId, startDate, endDate }),
  byOrder: (orderId: string) => api.get(`/rentals/order/${orderId}`),
  markReturned: (orderId: string, notes?: string) => api.patch(`/rentals/order/${orderId}/return`, { notes }),
  inspect: (orderId: string, body: { passed: boolean; notes?: string; damageFee?: number }) =>
    api.patch(`/rentals/order/${orderId}/inspect`, body),
  releaseDeposit: (orderId: string) => api.patch(`/rentals/order/${orderId}/release-deposit`),
};
