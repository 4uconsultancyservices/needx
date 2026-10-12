'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldAlert, Store, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useCurrentUser, isUserProvider, isUserAdmin } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  roleFallbackType?: 'provider' | 'admin';
}

export function AuthGuard({ children, requiredRoles, roleFallbackType }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user, isLoading, isError } = useCurrentUser();

  useEffect(() => {
    if (!isLoading && (!user || isError)) {
      const redirectUrl = `/login?next=${encodeURIComponent(pathname)}`;
      router.replace(redirectUrl);
    }
  }, [user, isLoading, isError, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-hope" />
        <p className="text-sm font-medium text-ink-soft">Loading your account...</p>
      </div>
    );
  }

  if (!user || isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Loader2 className="size-8 animate-spin text-hope" />
        <p className="mt-3 text-sm text-ink-soft">Redirecting to sign in...</p>
      </div>
    );
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole =
      user.roles?.some((r) => requiredRoles.includes(r)) ||
      (requiredRoles.includes('PROVIDER') && isUserProvider(user)) ||
      ((requiredRoles.includes('ADMIN') || requiredRoles.includes('SUPER_ADMIN')) && isUserAdmin(user));
    if (!hasRole) {
      if (roleFallbackType === 'provider') {
        return (
          <div className="mx-auto my-16 max-w-md rounded-card border border-border bg-surface p-8 text-center shadow-card">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-hope-soft text-hope border border-hope/20">
              <Store className="size-7" />
            </div>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">Provider Account Required</h2>
            <p className="mt-2 text-sm text-ink-soft">
              You need a provider profile to access the provider workspace, fulfill requests, and manage orders.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button variant="hope" asChild className="w-full font-semibold">
                <Link href="/dashboard/settings">
                  Upgrade to Provider <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="ghost" asChild className="w-full">
                <Link href="/dashboard">Back to User Dashboard</Link>
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="mx-auto my-16 max-w-md rounded-card border border-danger/20 bg-surface p-8 text-center shadow-card">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <ShieldAlert className="size-7" />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold text-ink">Access Restricted</h2>
          <p className="mt-2 text-sm text-ink-soft">
            You do not have administrative privileges to access this area.
          </p>
          <div className="mt-6">
            <Button variant="default" asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
