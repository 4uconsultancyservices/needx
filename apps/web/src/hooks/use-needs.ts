'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateNeedInput, ParseNeedInput, UpdateNeedInput } from '@needx/validation';
import { needsApi } from '../lib/api/needs';

export function useParseNeed() {
  return useMutation({ mutationFn: (input: ParseNeedInput) => needsApi.parse(input) });
}

export function useCreateNeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateNeedInput) => needsApi.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['needs', 'mine'] }),
  });
}

export function useNeed(id: string) {
  return useQuery({ queryKey: ['needs', id], queryFn: () => needsApi.byId(id), enabled: !!id });
}

export function useNeedMatches(id: string) {
  return useQuery({ queryKey: ['needs', id, 'matches'], queryFn: () => needsApi.matches(id), enabled: !!id });
}

export function useMyNeeds(params?: { page?: number; status?: string }) {
  return useQuery({ queryKey: ['needs', 'mine', params], queryFn: () => needsApi.mine(params) });
}

export function useNeedSearch(params?: { q?: string; categoryId?: string; city?: string; page?: number }) {
  return useQuery({ queryKey: ['needs', 'search', params], queryFn: () => needsApi.search(params) });
}

export function useUpdateNeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNeedInput }) => needsApi.update(id, input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['needs', vars.id] });
      qc.invalidateQueries({ queryKey: ['needs', 'mine'] });
    },
  });
}

export function useCancelNeed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => needsApi.cancel(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['needs', id] });
      qc.invalidateQueries({ queryKey: ['needs', 'mine'] });
    },
  });
}
