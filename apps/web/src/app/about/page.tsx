import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">About NEEDX</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-soft">
        <p>
          Most marketplaces start with a category tree and ask you to fit your situation into it. NEEDX starts with
          the opposite question: <em>what do you actually need?</em> You describe it in your own words, and the
          platform figures out the category, the budget, the location, and the most sensible way to fulfil it —
          buying, renting, borrowing, hiring, exchanging, or accepting a donation.
        </p>
        <p>
          Underneath, NEEDX is a straightforward, honestly-engineered marketplace: a weighted matching engine ranks
          real listings against real needs using distance, price fit, and provider trust signals; every payment is
          verified server-side before an order is marked paid; every offer negotiation is logged as an immutable
          audit trail; and every financial event is an append-only ledger entry, never a mutable balance field.
        </p>
        <p>
          NEEDX is built and seeded around Indian cities — Delhi, Gurgaon, Noida, Bangalore, Mumbai, Hyderabad, and
          Pune — as a demonstration of what a need-first marketplace looks like end to end, from the first keystroke
          in the search box to a completed order and a review.
        </p>
      </div>
    </div>
  );
}
