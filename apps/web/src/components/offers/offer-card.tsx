'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Check, MessageCircle, X } from 'lucide-react';
import type { Offer } from '@needx/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PriceDisplay } from '@/components/shared/price-display';
import { formatRelativeTime, TRANSACTION_MODE_LABELS } from '@/lib/utils';
import { useAcceptOffer, useCounterOffer, useRejectOffer } from '@/hooks/use-offers';
import { useCreateOrder } from '@/hooks/use-orders';
import { useRouter } from 'next/navigation';

const STATUS_VARIANT: Record<string, 'default' | 'accent' | 'trust' | 'faith' | 'danger'> = {
  SENT: 'trust',
  VIEWED: 'trust',
  COUNTERED: 'accent',
  ACCEPTED: 'faith',
  REJECTED: 'danger',
  EXPIRED: 'default',
  CANCELLED: 'default',
};

/** `perspective` controls which actions render — a need owner can
 * accept/reject/counter; a provider viewing their own sent offer can only
 * counter or withdraw. The server enforces this regardless either way. */
export function OfferCard({ offer, perspective }: { offer: Offer; perspective: 'owner' | 'provider' }) {
  const [countering, setCountering] = useState(false);
  const [counterPrice, setCounterPrice] = useState(String(offer.price));
  const accept = useAcceptOffer();
  const reject = useRejectOffer();
  const counter = useCounterOffer();
  const createOrder = useCreateOrder();
  const router = useRouter();

  const isOpen = ['SENT', 'VIEWED', 'COUNTERED'].includes(offer.status);

  return (
    <Card>
      <CardContent className="space-y-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <PriceDisplay amount={offer.price} currency={offer.currency} className="text-lg" />
            <p className="mt-0.5 text-xs text-ink-faint">{TRANSACTION_MODE_LABELS[offer.mode]} · {formatRelativeTime(offer.createdAt)}</p>
          </div>
          <Badge variant={STATUS_VARIANT[offer.status]}>{offer.status}</Badge>
        </div>
        {offer.message && <p className="rounded-control bg-canvas-alt p-3 text-sm text-ink-soft">&ldquo;{offer.message}&rdquo;</p>}

        {isOpen && (
          <div className="flex flex-wrap gap-2 pt-1">
            {countering ? (
              <div className="flex w-full items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="w-32"
                />
                <Button
                  size="sm"
                  variant="hope"
                  loading={counter.isPending}
                  onClick={async () => {
                    await counter.mutateAsync({ id: offer.id, input: { price: Number(counterPrice) } });
                    setCountering(false);
                    toast.success('Counter-offer sent');
                  }}
                >
                  Send counter
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setCountering(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                {perspective === 'owner' && (
                  <Button
                    size="sm"
                    variant="faith"
                    loading={accept.isPending || createOrder.isPending}
                    onClick={async () => {
                      await accept.mutateAsync(offer.id);
                      const order = await createOrder.mutateAsync(offer.id);
                      toast.success('Offer accepted — order created!');
                      router.push(`/dashboard/orders/${order.id}` as never);
                    }}
                  >
                    <Check /> Accept
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setCountering(true)}>
                  Counter
                </Button>
                {perspective === 'owner' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={reject.isPending}
                    onClick={async () => {
                      await reject.mutateAsync({ id: offer.id });
                      toast('Offer declined');
                    }}
                  >
                    <X /> Decline
                  </Button>
                )}
              </>
            )}
          </div>
        )}

        {offer.status === 'ACCEPTED' && (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/messages?conversation=offer:${offer.id}`}>
              <MessageCircle /> Message
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
