import { BadgeCheck, Lock, ShieldCheck, Star } from 'lucide-react';

const POINTS = [
  { icon: ShieldCheck, title: 'Verified providers', description: 'Phone, email, and identity checks before badges are shown — never faked.' },
  { icon: Lock, title: 'Protected payments', description: 'Funds are verified server-side before any order is marked paid. Deposits are held until inspection.' },
  { icon: Star, title: 'Real reviews only', description: 'Only actual transaction participants can leave a review, once, per order.' },
  { icon: BadgeCheck, title: 'Clear dispute process', description: 'Every order can be disputed and is resolved by a human moderator, not an algorithm.' },
];

export function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-trust">Protected Community</span>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">Earned through trust, protected at every step</h2>
          <p className="mt-3 text-sm text-ink-soft leading-relaxed">
            A community marketplace only flourishes when people have faith in one another and absolute trust in the platform. Every safeguard below is enforced on the server — never just a visual badge.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {POINTS.map((point) => (
            <div key={point.title} className="flex gap-3.5 items-start">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-faith-soft text-faith-deep border border-faith/20 shadow-sm mt-0.5">
                <point.icon className="size-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{point.title}</p>
                <p className="mt-1 text-xs text-ink-soft leading-relaxed">{point.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
