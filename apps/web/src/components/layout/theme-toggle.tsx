'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Laptop, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'system', icon: Laptop, label: 'System' },
  { value: 'dark', icon: Moon, label: 'Dark' },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className={cn('h-9 w-[102px] rounded-control bg-canvas-alt', className)} />;

  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-control bg-canvas-alt p-1', className)}>
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          onClick={() => setTheme(value)}
          className={cn(
            'flex size-7 items-center justify-center rounded-[0.5rem] transition-colors',
            theme === value ? 'bg-surface text-trust shadow-sm font-semibold' : 'text-ink-faint hover:text-ink',
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
