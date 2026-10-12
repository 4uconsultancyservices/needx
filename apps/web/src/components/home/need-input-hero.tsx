'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TRANSACTION_MODES } from '@/lib/constants';
import { TRANSACTION_MODE_LABELS } from '@/lib/utils';

const EXAMPLES = [
  'I need a projector for 2 days in Gurgaon under ₹3000',
  'Looking for a wedding photographer in Bangalore',
  'Need a cordless drill for the weekend',
  'Want to buy a study table under ₹4000',
  'Need an electrician tomorrow morning',
];

/** The product's signature moment: typed language visibly becoming a
 * structured, actionable request — right in the hero, before the visitor
 * types anything. Mirrors what actually happens on /needs/new. */
const FIRST_EXAMPLE = EXAMPLES[0] ?? '';

function TypingPlaceholder({ active }: { active: boolean }) {
  const [exampleIndex, setExampleIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing');

  useEffect(() => {
    if (active) return; // stop animating once the user is typing for real
    const example = EXAMPLES[exampleIndex] ?? FIRST_EXAMPLE;
    let timeout: ReturnType<typeof setTimeout>;

    if (phase === 'typing') {
      if (charCount < example.length) {
        timeout = setTimeout(() => setCharCount((c) => c + 1), 28);
      } else {
        timeout = setTimeout(() => setPhase('holding'), 1600);
      }
    } else if (phase === 'holding') {
      timeout = setTimeout(() => setPhase('deleting'), 900);
    } else {
      if (charCount > 0) {
        timeout = setTimeout(() => setCharCount((c) => c - 1), 12);
      } else {
        setPhase('typing');
        setExampleIndex((i) => (i + 1) % EXAMPLES.length);
      }
    }
    return () => clearTimeout(timeout);
  }, [active, charCount, phase, exampleIndex]);

  if (active) return null;
  return (
    <span className="pointer-events-none absolute inset-y-0 left-5 flex items-center text-ink-faint">
      {(EXAMPLES[exampleIndex] ?? FIRST_EXAMPLE).slice(0, charCount)}
      <span className="ml-0.5 inline-block h-5 w-[2px] animate-pulse bg-ink-faint" />
    </span>
  );
}

export function NeedInputHero() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const go = () => {
    if (!text.trim()) {
      inputRef.current?.focus();
      return;
    }
    const params = new URLSearchParams({ text: text.trim() });
    if (mode) params.set('mode', mode);
    router.push(`/needs/new?${params.toString()}`);
  };

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              go();
            }
          }}
          rows={2}
          className={cn(
            'w-full resize-none rounded-card border border-border bg-surface px-5 py-4 pr-14 text-base text-ink shadow-card',
            'placeholder:text-transparent focus:outline-none focus:ring-2 focus:ring-hope/40 sm:text-lg',
          )}
          placeholder="What do you need?"
          aria-label="What do you need?"
        />
        <TypingPlaceholder active={text.length > 0} />
        <button
          onClick={go}
          aria-label="Find what I need"
          className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full bg-gradient-to-tr from-[#1e40af] to-[#0d9488] text-white shadow-md transition-transform hover:scale-105 active:scale-95"
        >
          <ArrowRight className="size-4" />
        </button>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <Sparkles className="size-4 text-hope" />
        {TRANSACTION_MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode((current) => (current === m ? null : m))}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-semibold transition-all',
              mode === m
                ? 'border-hope bg-hope text-white shadow-sm'
                : 'border-border bg-surface text-ink-soft hover:border-hope/40 hover:text-ink',
            )}
          >
            {TRANSACTION_MODE_LABELS[m]}
          </button>
        ))}
      </div>

      <Button variant="default" size="lg" className="mt-5 w-full sm:w-auto font-semibold shadow-md bg-gradient-to-r from-trust to-hope text-white hover:opacity-95" onClick={go}>
        Find what I need <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}
