'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AlertTriangle, Check, CreditCard, MessageCircle, Star } from 'lucide-react';
import type { Order } from '@needx/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { PriceDisplay } from '@/components/shared/price-display';
import {
  useCancelOrder,
  useCheckout,
  useCompleteOrder,
  useConfirmOrder,
  useMarkOrderReady,
  useStartOrder,
} from '@/hooks/use-orders';
import { useCreateReview } from '@/hooks/use-misc';
import { formatDate, ORDER_STATUS_LABELS } from '@/lib/utils';

export function OrderDetail({ order, viewerRole }: { order: Order; viewerRole: 'buyer' | 'provider' }) {
  const router = useRouter();
  const checkout = useCheckout();
  const confirm = useConfirmOrder();
  const ready = useMarkOrderReady();
  const start = useStartOrder();
  const complete = useCompleteOrder();
  const cancel = useCancelOrder();
  const createReview = useCreateReview();
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const canCancel = ['PENDING', 'PAYMENT_PENDING', 'PAID', 'CONFIRMED', 'READY'].includes(order.status);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono-num text-xs text-ink-faint">Order #{order.id.slice(-8).toUpperCase()}</p>
              <p className="mt-1 font-display text-xl font-semibold text-ink">{order.type} order</p>
            </div>
            <Badge variant={order.status === 'COMPLETED' ? 'faith' : order.status === 'CANCELLED' ? 'danger' : 'trust'}>{ORDER_STATUS_LABELS[order.status]}</Badge>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <PriceDisplay amount={order.amount} currency={order.currency} className="text-lg" />
            <span className="text-xs text-ink-faint">Placed {formatDate(order.createdAt)}</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {order.status === 'PENDING' && viewerRole === 'buyer' && (
              <Button
                variant="default"
                loading={checkout.isPending}
                onClick={async () => {
                  const res = await checkout.mutateAsync(order.id);
                  if (res.checkoutUrl) router.push(res.checkoutUrl as never);
                }}
              >
                <CreditCard /> Pay now
              </Button>
            )}
            {order.status === 'PAYMENT_PENDING' && viewerRole === 'buyer' && (
              <Button
                variant="outline"
                loading={checkout.isPending}
                onClick={async () => {
                  const res = await checkout.mutateAsync(order.id);
                  if (res.checkoutUrl) router.push(res.checkoutUrl as never);
                }}
              >
                <CreditCard /> Resume payment
              </Button>
            )}
            {order.status === 'PAID' && viewerRole === 'provider' && (
              <Button variant="default" loading={confirm.isPending} onClick={() => confirm.mutate(order.id)}>
                <Check /> Confirm order
              </Button>
            )}
            {order.status === 'CONFIRMED' && viewerRole === 'provider' && (
              <Button variant="default" loading={ready.isPending} onClick={() => ready.mutate(order.id)}>
                Mark ready
              </Button>
            )}
            {order.status === 'READY' && (
              <Button variant="default" loading={start.isPending} onClick={() => start.mutate(order.id)}>
                {order.type === 'RENT' ? 'Start rental' : 'Start order'}
              </Button>
            )}
            {order.status === 'ACTIVE' && (
              <Button variant="faith" loading={complete.isPending} onClick={() => complete.mutate(order.id)}>
                <Check /> Mark complete
              </Button>
            )}
            {order.status === 'COMPLETED' && (
              <Button variant="hope" onClick={() => setReviewOpen(true)}>
                <Star /> Leave a review
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href={`/dashboard/messages?conversation=order:${order.id}`}>
                <MessageCircle /> Message
              </a>
            </Button>
            {canCancel && (
              <ConfirmDialog
                trigger={
                  <Button variant="ghost">
                    Cancel order
                  </Button>
                }
                title="Cancel this order?"
                description="This cannot be undone. Any payment already made will need to be refunded separately."
                destructive
                confirmLabel="Cancel order"
                onConfirm={() => cancel.mutate({ id: order.id })}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <p className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <AlertTriangle className="size-4 text-ink-faint" /> Order timeline
          </p>
          <ol className="space-y-3 border-l border-border pl-4">
            {order.statusHistory.map((h, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute -left-[1.35rem] top-1 size-2 rounded-full bg-accent" />
                <span className="font-medium text-ink">{ORDER_STATUS_LABELS[h.status]}</span>
                <span className="ml-2 text-xs text-ink-faint">{formatDate(h.at)}</span>
                {h.note && <p className="text-xs text-ink-soft">{h.note}</p>}
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How was it?</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
                <Star className={n <= rating ? 'size-8 fill-amber-400 text-amber-400' : 'size-8 text-border'} />
              </button>
            ))}
          </div>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell others about your experience (optional)" rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              loading={createReview.isPending}
              onClick={async () => {
                try {
                  await createReview.mutateAsync({ orderId: order.id, ratings: { overall: rating }, comment: comment || undefined });
                  toast.success('Thanks for your review!');
                  setReviewOpen(false);
                } catch {
                  toast.error('Could not submit your review.');
                }
              }}
            >
              Submit review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
