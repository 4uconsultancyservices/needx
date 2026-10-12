import { ArrowRight, MapPin, Sparkles, Tag, Wallet } from 'lucide-react';
import { NeedInputHero } from './need-input-hero';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-canvas via-canvas to-canvas-alt/40">
      {/* Ambient background glow representing Hope & Trust */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-hope/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 right-0 size-[500px] rounded-full bg-trust/10 blur-3xl" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-trust/20 bg-trust-soft px-3.5 py-1 text-xs font-semibold text-trust dark:text-trust">
            <Sparkles className="size-3.5 text-hope" />
            <span>Built on Hope · Guided by Faith · Earned Through Trust</span>
          </div>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            What do you{' '}
            <span className="italic bg-gradient-to-r from-hope to-trust bg-clip-text text-transparent">
              need?
            </span>
          </h1>

          <p className="mt-4 max-w-lg text-base text-ink-soft sm:text-lg leading-relaxed">
            Describe it in plain language. NEEDX understands your intent, matches you with verified people and businesses nearby, and lets you transact with confidence — buy, rent, borrow, hire, exchange, or donate.
          </p>

          <div className="mt-8 max-w-xl">
            <NeedInputHero />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
            <span>Verified in India:</span>
            <span>Delhi · Gurgaon · Noida · Bangalore · Mumbai · Hyderabad · Pune</span>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="card-surface animate-fade-up p-6 shadow-card hover:shadow-card-hover transition-all" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-hope">You type naturally</p>
              <span className="rounded-full bg-trust-soft px-2.5 py-0.5 text-[11px] font-semibold text-trust">Intelligent match</span>
            </div>
            <p className="mt-3 font-display text-lg text-ink font-medium leading-snug">
              &ldquo;I need a projector for 2 days in Gurgaon under ₹3,000&rdquo;
            </p>
            <div className="my-4 flex items-center gap-2 text-ink-faint">
              <div className="h-px flex-1 bg-border" />
              <ArrowRight className="size-4 text-hope" />
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-faint">NEEDX understands</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-hope-soft px-3 py-1.5 text-xs font-semibold text-hope-deep border border-hope/20">
                <Tag className="size-3.5" /> Electronics · Rent
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-faith-soft px-3 py-1.5 text-xs font-semibold text-faith-deep border border-faith/20">
                <Wallet className="size-3.5" /> Up to ₹3,000
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-trust-soft px-3 py-1.5 text-xs font-semibold text-trust border border-trust/20">
                <MapPin className="size-3.5" /> Gurgaon · 2 days
              </span>
            </div>
            <div className="mt-5 rounded-control bg-canvas-alt/80 p-3.5 border border-border/60">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-faith animate-pulse" />
                  3 verified providers nearby
                </span>
                <span className="font-mono-num text-xs font-bold text-faith">94% match</span>
              </div>
            </div>
          </div>
          <div
            className="absolute -bottom-6 -left-6 size-28 rounded-full bg-hope/20 blur-2xl pointer-events-none"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
