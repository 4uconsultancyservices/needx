'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi, paymentsApi, rentalsApi } from '../lib/api/orders';

export function useOrder(id: string) {
  return useQuery({ queryKey: ['orders', id], queryFn: () => ordersApi.byId(id), enabled: !!id });
}

export function useMyOrders(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({ queryKey: ['orders', 'mine', params], queryFn: () => ordersApi.mine(params) });
}

export function useMyProviderOrders(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({ queryKey: ['orders', 'provider-mine', params], queryFn: () => ordersApi.providerMine(params) });
}

function useOrderMutation<TArgs, TResult>(mutationFn: (args: TArgs) => Promise<TResult>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useCreateOrder() {
  return useOrderMutation((offerId: string) => ordersApi.create(offerId));
}
export function useConfirmOrder() {
  return useOrderMutation((id: string) => ordersApi.confirm(id));
}
export function useMarkOrderReady() {
  return useOrderMutation((id: string) => ordersApi.ready(id));
}
export function useStartOrder() {
  return useOrderMutation((id: string) => ordersApi.start(id));
}
export function useCompleteOrder() {
  return useOrderMutation((id: string) => ordersApi.complete(id));
}
export function useCancelOrder() {
  return useOrderMutation(({ id, reason }: { id: string; reason?: string }) => ordersApi.cancel(id, reason));
}

export function useCheckout() {
  return useMutation({ mutationFn: (orderId: string) => paymentsApi.checkout(orderId) });
}

export function useCreateRental() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, startDate, endDate }: { orderId: string; startDate?: string; endDate?: string }) =>
      rentalsApi.create(orderId, startDate, endDate),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['rentals', vars.orderId] }),
  });
}

export function useRental(orderId: string) {
  return useQuery({ queryKey: ['rentals', orderId], queryFn: () => rentalsApi.byOrder(orderId), enabled: !!orderId, retry: false });
}
