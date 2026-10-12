'use client';

import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-canvas-alt">
        <WifiOff className="size-7 text-ink-faint" />
      </span>
      <h1 className="mt-5 font-display text-xl font-semibold text-ink">You&apos;re offline</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Some features need a connection. Previously viewed pages may still be available from cache.
      </p>
      <Button variant="default" className="mt-6" onClick={() => window.location.reload()}>
        <RefreshCw /> Try again
      </Button>
    </div>
  );
}
