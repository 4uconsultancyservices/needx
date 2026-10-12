import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Handshake, MessageSquareText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'How it works' };

const STEPS = [
  { icon: MessageSquareText, title: 'Describe what you need', body: 'Type it the way you\u2019d tell a friend — no categories to hunt through, no forms. "I need a projector for 2 days in Gurgaon under \u20b93,000" is enough.' },
  { icon: Sparkles, title: 'NEEDX understands and matches', body: 'A parser extracts category, budget, dates, and location from your text, then a weighted matching engine ranks nearby listings and providers by relevance, distance, price fit, and trust signals.' },
  { icon: Handshake, title: 'Negotiate and transact', body: 'Providers send offers, you can counter, accept, or decline. Once accepted, payment is verified server-side before anything is marked paid, and deposits are held until rentals are returned and inspected.' },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">How NEEDX works</h1>
      <p className="mt-3 text-ink-soft">From a plain-language request to a completed transaction, in three steps.</p>

      <div className="mt-10 space-y-8">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex gap-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0f294a] via-[#1e40af] to-[#0d9488] font-display font-bold text-white shadow-sm ring-1 ring-white/20">
              {i + 1}
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink">{step.title}</h2>
              <p className="mt-1 text-sm text-ink-soft leading-relaxed">{step.body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Brand Core Pillars */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-5 border-l-4 border-l-hope">
          <p className="text-xs font-bold uppercase tracking-wider text-hope">Hope</p>
          <p className="mt-1.5 font-display text-base font-semibold text-ink">Optimism & Opportunity</p>
          <p className="mt-1 text-xs text-ink-soft leading-relaxed">
            Never hesitate to ask. No matter how niche or urgent, there is someone in your community ready to help.
          </p>
        </div>
        <div className="card-surface p-5 border-l-4 border-l-faith">
          <p className="text-xs font-bold uppercase tracking-wider text-faith-deep">Faith</p>
          <p className="mt-1.5 font-display text-base font-semibold text-ink">Confidence & Purpose</p>
          <p className="mt-1 text-xs text-ink-soft leading-relaxed">
            Believe in the power of mutual aid. Verified providers and neighbours unite to solve everyday problems together.
          </p>
        </div>
        <div className="card-surface p-5 border-l-4 border-l-trust">
          <p className="text-xs font-bold uppercase tracking-wider text-trust">Trust</p>
          <p className="mt-1.5 font-display text-base font-semibold text-ink">Security & Integrity</p>
          <p className="mt-1 text-xs text-ink-soft leading-relaxed">
            Every transaction is protected by server-enforced safeguards, identity verification, and human oversight.
          </p>
        </div>
      </div>

      <div className="mt-8 card-surface p-6">
        <h2 className="font-display text-lg font-semibold text-ink">The six ways to transact</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            ['Buy', 'Own it outright.'],
            ['Rent', 'Pay for a fixed period, return it after.'],
            ['Borrow', 'Often free, may need a refundable deposit.'],
            ['Hire', 'A service, not a physical item.'],
            ['Exchange', 'Trade something for something else.'],
            ['Donate', 'Give or receive at no cost.'],
          ].map(([term, def]) => (
            <div key={term}>
              <dt className="text-sm font-semibold text-ink">{term}</dt>
              <dd className="text-xs text-ink-soft">{def}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Button size="lg" className="mt-10 font-semibold shadow-md bg-gradient-to-r from-trust to-hope text-white hover:opacity-95" asChild>
        <Link href="/needs/new">
          Try it — post a need <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
