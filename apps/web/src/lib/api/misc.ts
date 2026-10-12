import { api } from '../api-client';
import type { Favorite, Notification, Review } from '@needx/types';
import type { CreateReviewInput } from '@needx/validation';

export const reviewsApi = {
  create: (input: CreateReviewInput) => api.post<Review>('/reviews', input),
  forUser: (userId: string, page = 1) => api.get<{ items: Review[]; total: number }>(`/reviews/for-user/${userId}`, { page }),
};

export const favoritesApi = {
  list: (targetType?: string) => api.get<Favorite[]>('/favorites', targetType ? { type: targetType } : undefined),
  add: (targetType: string, targetId: string) => api.post<Favorite>('/favorites', { targetType, targetId }),
  remove: (targetType: string, targetId: string) => api.delete<{ removed: true }>('/favorites', { targetType, targetId }),
};

export const notificationsApi = {
  list: (unreadOnly = false) => api.get<{ data: Notification[]; meta: { total: number; unreadCount: number } }>('/notifications', unreadOnly ? { unread: 'true' } : undefined),
  markRead: (id: string) => api.patch<{ read: true }>(`/notifications/${id}/read`),
  markAllRead: () => api.patch<{ read: true }>('/notifications/read-all'),
  vapidPublicKey: () => api.get<{ publicKey: string | null }>('/notifications/vapid-public-key'),
  subscribePush: (sub: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
    api.post<{ subscribed: true }>('/notifications/push-subscriptions', sub),
};

export const reportsApi = {
  create: (input: { targetType: string; targetId: string; reason: string; details?: string }) =>
    api.post<{ id: string }>('/reports', input),
};
