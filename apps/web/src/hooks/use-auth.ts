'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Role, User } from '@needx/types';
import type { LoginInput, RegisterInput } from '@needx/validation';
import { authApi } from '../lib/api/auth';
import { ApiError } from '../lib/api-client';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: authApi.me,
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: (user) => qc.setQueryData(['me'], user),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (user) => qc.setQueryData(['me'], user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      qc.setQueryData(['me'], null);
      qc.clear();
    },
  });
}

export function isUserProvider(
  user?: { roles?: Role[]; provider?: { isProvider?: boolean } | null } | null,
): boolean {
  if (!user) return false;
  if (user.provider?.isProvider === false) return false;
  const hasProviderRole =
    Array.isArray(user.roles) &&
    (user.roles.includes('PROVIDER') || user.roles.includes('BUSINESS'));
  if (Array.isArray(user.roles) && !hasProviderRole) return false;
  const hasProviderFlag =
    user.provider?.isProvider === true ||
    (user.provider?.isProvider as unknown) === 'true';
  return Boolean(hasProviderRole || hasProviderFlag);
}

export function isUserAdmin(user?: { roles?: Role[] } | null): boolean {
  if (!user) return false;
  return Boolean(
    user.roles?.includes('ADMIN') ||
    user.roles?.includes('SUPER_ADMIN'),
  );
}

export function useUserRoleInfo() {
  const { data: user, isLoading, isError } = useCurrentUser();
  return {
    user,
    isLoading,
    isError,
    isProvider: isUserProvider(user),
    isAdmin: isUserAdmin(user),
  };
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
