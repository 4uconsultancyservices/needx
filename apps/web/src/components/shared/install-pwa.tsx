'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISSED_KEY = 'needx_install_dismissed_at';
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** Custom install banner — browsers only fire beforeinstallprompt once
 * criteria are met, and we additionally respect the user's last dismissal
 * so this never nags. Renders nothing if already installed (standalone). */
export function InstallPwa() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const lastDismissed = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
    if (Date.now() - lastDismissed < DISMISS_COOLDOWN_MS) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (pathname?.startsWith('/admin')) return null;
  if (!visible || !deferredPrompt) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-sm rounded-card border border-border bg-surface/95 p-4 shadow-card-hover backdrop-blur-md animate-fade-up md:bottom-6 md:left-6 md:right-auto">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0f294a] via-[#1e40af] to-[#0d9488] text-white font-display font-bold text-base shadow-sm ring-1 ring-white/20">N</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">Install NEEDX</p>
          <p className="mt-0.5 text-xs text-ink-soft">Add to your home screen for a faster, app-like experience.</p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="hope"
              onClick={async () => {
                await deferredPrompt.prompt();
                await deferredPrompt.userChoice;
                setDeferredPrompt(null);
                setVisible(false);
              }}
            >
              <Download /> Install
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Dismiss" className="text-ink-faint hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
