import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

const SECTIONS = [
  { title: '1. What NEEDX is', body: 'NEEDX is a marketplace that connects people who need something with people or businesses who can provide it, via buying, renting, borrowing, hiring, exchanging, or donating. NEEDX facilitates these connections and, where applicable, payment processing — it is not a party to the underlying transaction between a need-owner and a provider.' },
  { title: '2. Accounts', body: 'You must provide accurate information when registering and are responsible for activity under your account. You must be legally able to enter into contracts in your jurisdiction to transact on NEEDX.' },
  { title: '3. Listings and needs', body: 'Providers are responsible for the accuracy of their listings, including price, availability, and condition. Need-owners are responsible for the accuracy of their needs, including budget and requirements. Prohibited items (weapons, controlled substances, counterfeit goods, stolen property) may never be listed; violations may result in account suspension.' },
  { title: '4. Payments', body: 'Payments are processed through NEEDX\u2019s payment abstraction layer. Funds are held until an order reaches a state that releases them per that order\u2019s type. Platform fees are disclosed before you confirm a transaction. Refunds and deposit releases follow the resolution rules described in each order\u2019s status history.' },
  { title: '5. Disputes', body: 'Either party to an order may open a dispute. Disputes are reviewed by a human moderator, who may resolve in favor of the buyer, the provider, or close the dispute without a change in outcome. Moderator decisions are recorded in an audit trail.' },
  { title: '6. Reviews', body: 'Only participants in a completed order may review each other, once per order. Reviews must reflect genuine experiences; fraudulent reviews may be removed and repeat offenders suspended.' },
  { title: '7. Suspension and termination', body: 'NEEDX may suspend or terminate accounts that violate these terms, engage in fraud, or pose a safety risk to other users. We aim to explain suspensions where doing so does not compromise an ongoing investigation.' },
  { title: '8. Limitation of liability', body: 'NEEDX provides the marketplace platform "as is." We are not liable for the quality, safety, or legality of items or services listed, the accuracy of listings, or the ability of providers or need-owners to complete a transaction, except as required by applicable law.' },
  { title: '9. Changes to these terms', body: 'We may update these terms from time to time. Material changes will be communicated in-app before they take effect.' },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Terms of Service</h1>
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
