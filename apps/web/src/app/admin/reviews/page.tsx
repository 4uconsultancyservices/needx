'use client';

import { EmptyState } from '@/components/shared/empty-state';
import { Star } from 'lucide-react';

export default function AdminReviewsPage() {
  return (
    <EmptyState
      icon={Star}
      title="Review moderation"
      description="Reviews can only be created once per completed order by an actual participant — there is no separate moderation queue needed today. A future iteration could add reporting of individual reviews via /admin/reports (targetType REVIEW is already modeled)."
    />
  );
}
