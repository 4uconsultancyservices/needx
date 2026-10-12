import { HeartHandshake, ShieldCheck, Sparkles } from 'lucide-react';

const STEPS = [
  {
    icon: Sparkles,
    value: 'Hope',
    title: '1. Voice what you need',
    description: 'Describe what you need naturally in your own words. Every request is an opportunity for someone in your community to help.',
    accentColor: 'text-hope bg-hope-soft border-hope/25',
    badgeGradient: 'from-hope to-hope-deep',
  },
  {
    icon: HeartHandshake,
    value: 'Faith',
    title: '2. Connect with genuine providers',
    description: 'NEEDX matches you with real, verified neighbors and local businesses who are ready and eager to fulfill your request.',
    accentColor: 'text-faith-deep bg-faith-soft border-faith/25',
    badgeGradient: 'from-faith to-faith-deep',
  },
  {
    icon: ShieldCheck,
    value: 'Trust',
    title: '3. Transact with complete security',
    description: 'Buy, rent, borrow, hire, or exchange with escrow-protected payments, identity-verified participants, and real human dispute support.',
    accentColor: 'text-trust bg-trust-soft border-trust/25',
    badgeGradient: 'from-trust to-trust-deep',
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-gradient-to-b from-canvas-alt/40 via-surface to-canvas-alt/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-hope">The NEEDX Way</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">How NEEDX works for you</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Three simple steps powered by our core commitment: Built on Hope. Guided by Faith. Earned Through Trust.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div key={step.title} className="card-surface relative p-7 hover:shadow-card-hover transition-all duration-300">
              <span className={`absolute -top-3.5 -left-3.5 flex size-8 items-center justify-center rounded-xl bg-gradient-to-tr ${step.badgeGradient} font-display text-sm font-bold text-white shadow-sm ring-2 ring-surface`}>
                {i + 1}
              </span>
              <div className="flex items-center justify-between">
                <span className={`flex size-12 items-center justify-center rounded-2xl border ${step.accentColor}`}>
                  <step.icon className="size-6" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                  {step.value}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">{step.title.replace(/^\d+\.\s/, '')}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
