'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { useMyListings } from '@/hooks/use-listings';
import { useMyOffers } from '@/hooks/use-offers';
import { useMyProviderOrders } from '@/hooks/use-orders';

export default function ProviderAnalyticsPage() {
  const { data: listings } = useMyListings({ page: 1, limit: 100 });
  const { data: offers } = useMyOffers({ page: 1, limit: 100 });
  const { data: orders } = useMyProviderOrders({ page: 1, limit: 100 });

  const accepted = offers?.data.filter((o) => o.status === 'ACCEPTED').length ?? 0;
  const totalOffers = offers?.data.length ?? 0;
  const acceptanceRate = totalOffers > 0 ? Math.round((accepted / totalOffers) * 100) : 0;
  const completed = orders?.data.filter((o) => o.status === 'COMPLETED').length ?? 0;
  const revenue = orders?.data.filter((o) => o.status === 'COMPLETED').reduce((sum, o) => sum + o.amount, 0) ?? 0;

  const chartData = [
    { name: 'Listings', value: listings?.meta.total ?? 0 },
    { name: 'Offers sent', value: totalOffers },
    { name: 'Accepted', value: accepted },
    { name: 'Orders', value: orders?.meta.total ?? 0 },
    { name: 'Completed', value: completed },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="card-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">{acceptanceRate}%</p>
          <p className="text-xs text-ink-faint">Offer acceptance rate</p>
        </div>
        <div className="card-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">{completed}</p>
          <p className="text-xs text-ink-faint">Completed orders</p>
        </div>
        <div className="card-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">₹{revenue.toLocaleString('en-IN')}</p>
          <p className="text-xs text-ink-faint">Revenue (completed)</p>
        </div>
        <div className="card-surface p-4">
          <p className="font-display text-2xl font-semibold text-ink">{listings?.meta.total ?? 0}</p>
          <p className="text-xs text-ink-faint">Active listings</p>
        </div>
      </div>

      <div className="card-surface p-5">
        <p className="mb-4 text-sm font-semibold text-ink">Funnel overview</p>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-ink-faint)" fontSize={12} />
              <YAxis stroke="var(--color-ink-faint)" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '0.7rem' }} />
              <Bar dataKey="value" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink-faint">Computed from your own listings, offers, and orders.</p>
      </div>
    </div>
  );
}
