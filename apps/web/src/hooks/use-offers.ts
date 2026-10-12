'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CounterOfferInput, CreateOfferInput } from '@needx/validation';
import { offersApi } from '../lib/api/offers';

export function useOffer(id: string) {
  return useQuery({ queryKey: ['offers', id], queryFn: () => offersApi.byId(id), enabled: !!id });
}

export function useOffersForNeed(needId: string) {
  return useQuery({ queryKey: ['offers', 'for-need', needId], queryFn: () => offersApi.forNeed(needId), enabled: !!needId });
}

export function useMyOffers(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({ queryKey: ['offers', 'mine', params], queryFn: () => offersApi.mine(params) });
}

function useOfferMutation<TArgs, TResult>(mutationFn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['offers'] });
      qc.invalidateQueries({ queryKey: ['needs'] });
    },
  });
}

export function useCreateOffer() {
  return useOfferMutation((input: CreateOfferInput) => offersApi.create(input));
}
export function useCounterOffer() {
  return useOfferMutation(({ id, input }: { id: string; input: CounterOfferInput }) => offersApi.counter(id, input));
}
export function useAcceptOffer() {
  return useOfferMutation((id: string) => offersApi.accept(id));
}
export function useRejectOffer() {
  return useOfferMutation(({ id, message }: { id: string; message?: string }) => offersApi.reject(id, message));
}
export function useCancelOffer() {
  return useOfferMutation((id: string) => offersApi.cancel(id));
}
