'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateListingInput, ListingSearchQuery, UpdateListingInput } from '@needx/validation';
import { listingsApi } from '../lib/api/listings';

export function useListing(id: string) {
  return useQuery({ queryKey: ['listings', id], queryFn: () => listingsApi.byId(id), enabled: !!id });
}

export function useListingSearch(params?: Partial<ListingSearchQuery>) {
  return useQuery({ queryKey: ['listings', 'search', params], queryFn: () => listingsApi.search(params) });
}

export function useMyListings(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({ queryKey: ['listings', 'mine', params], queryFn: () => listingsApi.mine(params) });
}

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateListingInput) => listingsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings', 'mine'] }),
  });
}

export function useUpdateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateListingInput }) => listingsApi.update(id, input),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['listings', vars.id] });
      qc.invalidateQueries({ queryKey: ['listings', 'mine'] });
    },
  });
}

export function useSetListingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'pause' | 'activate' | 'archive' }) => {
      if (action === 'pause') return listingsApi.pause(id);
      if (action === 'activate') return listingsApi.activate(id);
      return listingsApi.archive(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['listings', 'mine'] }),
  });
}
