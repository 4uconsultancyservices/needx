'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateReviewInput } from '@needx/validation';
import { favoritesApi, notificationsApi, reportsApi, reviewsApi } from '../lib/api/misc';

export function useNotifications(unreadOnly = false) {
  return useQuery({ queryKey: ['notifications', unreadOnly], queryFn: () => notificationsApi.list(unreadOnly), refetchInterval: 30_000 });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });
}

export function useFavorites(targetType?: string) {
  return useQuery({ queryKey: ['favorites', targetType], queryFn: () => favoritesApi.list(targetType) });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetType, targetId, isFavorited }: { targetType: string; targetId: string; isFavorited: boolean }): Promise<void> => {
      if (isFavorited) {
        await favoritesApi.remove(targetType, targetId);
      } else {
        await favoritesApi.add(targetType, targetId);
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateReviewInput) => reviewsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });
}

export function useReviewsForUser(userId: string) {
  return useQuery({ queryKey: ['reviews', userId], queryFn: () => reviewsApi.forUser(userId), enabled: !!userId });
}

export function useCreateReport() {
  return useMutation({
    mutationFn: (input: { targetType: string; targetId: string; reason: string; details?: string }) =>
      reportsApi.create(input),
  });
}
