'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { AuthShell } from '@/components/auth/auth-shell';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';

function VerifyInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthShell title="Email verification">
      {status === 'checking' && <p className="text-sm text-ink-soft">Verifying your email...</p>}
      {status === 'success' && (
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="size-10 text-faith" />
          <p className="text-sm text-ink-soft">Your email is verified. You&apos;re all set.</p>
          <Button variant="default" asChild className="mt-2">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      )}
      {status === 'error' && (
        <div className="flex flex-col items-center gap-3 text-center">
          <XCircle className="size-10 text-danger" />
          <p className="text-sm text-ink-soft">This verification link is invalid or has expired.</p>
          <Button variant="outline" asChild className="mt-2">
            <Link href="/dashboard/settings">Request a new link</Link>
          </Button>
        </div>
      )}
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
