import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-border bg-surface px-6 py-14 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-danger-soft">
        <AlertTriangle className="size-6 text-danger" />
      </div>
      <p className="font-display text-lg font-semibold text-ink">Something went wrong</p>
      <p className="mt-1.5 max-w-sm text-sm text-ink-soft">{message ?? "We couldn't load this information."}</p>
      {onRetry && (
        <Button variant="outline" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
