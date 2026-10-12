import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

const SECTIONS = [
  { title: '1. What we collect', body: 'Account details you provide (name, email, phone), content you create (needs, listings, messages, reviews), and approximate location derived from the city you select — never precise GPS coordinates unless a transaction specifically requires an address, and even then only shared with the relevant counterparty.' },
  { title: '2. How we use it', body: 'To operate the marketplace: matching needs to listings, facilitating messaging and payments, computing trust signals like rating and response rate, and keeping the platform safe via moderation and audit logging.' },
  { title: '3. What we never do', body: 'We never sell your personal data. We never expose your exact address publicly — location is shown at city level until an order requires more precision, and even then it is shared only with your transaction counterparty. We never let an AI model directly authorize a payment, refund, payout, ban, or other irreversible action — those are always deterministic, human-reviewable backend decisions.' },
  { title: '4. Data retention', body: 'Financial ledger entries and audit logs are retained indefinitely and are never edited or deleted, for accounting integrity and dispute resolution. You may request deletion of your profile information subject to these retention requirements.' },
  { title: '5. Third parties', body: 'Payments, SMS, and email delivery are handled through pluggable provider abstractions. In this demonstration deployment, no real third-party credentials are configured — see the project\u2019s ENVIRONMENT.md for exactly what is wired up versus stubbed for local development.' },
  { title: '6. Your choices', body: 'You can update or remove your profile information, addresses, and push notification subscriptions at any time from Settings. You can request an export or deletion of your account by contacting us.' },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Privacy Policy</h1>
      <p className="mt-2 text-xs text-ink-faint">Last updated: a demonstration document, not legal advice.</p>
      <div className="mt-8 space-y-6">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-base font-semibold text-ink">{s.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
