'use client';

import { use } from 'react';
import { useOrder } from '@/hooks/use-orders';
import { OrderDetail } from '@/components/orders/order-detail';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';

export default function ProviderOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: order, isLoading } = useOrder(id);

  if (isLoading || !order) return <CardGridSkeleton count={2} />;
  return <OrderDetail order={order} viewerRole="provider" />;
}
