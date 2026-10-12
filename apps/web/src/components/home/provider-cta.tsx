import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProviderCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-2xl border border-trust/30 bg-gradient-to-br from-[#0c2340] via-[#163b66] to-[#0d9488] p-8 text-white shadow-card-hover sm:flex-row sm:items-center sm:justify-between sm:p-12">
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/95 border border-white/20">
            <TrendingUp className="size-3.5 text-accent" /> Opportunity for Providers
          </span>
          <h2 className="mt-4 font-display text-2xl font-semibold text-white sm:text-3xl leading-snug">
            Have something to offer? Put your faith in NEEDX.
          </h2>
          <p className="mt-2 max-w-lg text-sm text-white/85 leading-relaxed">
            List your goods, gear, or services and get matched with people who actively need what you have. Fair exchanges, verified payments, real human relationships.
          </p>
        </div>
        <Button size="lg" asChild className="relative z-10 shrink-0 font-semibold shadow-lg bg-white text-trust-deep hover:bg-white/90">
          <Link href="/register">
            Become a provider <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
