'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useNeed, useUpdateNeed } from '@/hooks/use-needs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';

export default function EditNeedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: need, isLoading } = useNeed(id);
  const updateNeed = useUpdateNeed();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  useEffect(() => {
    if (need) {
      setTitle(need.title);
      setDescription(need.description);
      setBudgetMax(need.budget?.max ? String(need.budget.max) : '');
    }
  }, [need]);

  if (isLoading || !need) return <CardGridSkeleton count={1} />;

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>
      <div>
        <Label>Budget (max ₹)</Label>
        <Input type="number" inputMode="numeric" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
      </div>
      <Button
        variant="hope"
        loading={updateNeed.isPending}
        onClick={async () => {
          try {
            await updateNeed.mutateAsync({
              id,
              input: { title, description, budget: budgetMax ? { max: Number(budgetMax), currency: 'INR' } : undefined },
            });
            toast.success('Need updated');
            router.push(`/needs/${id}`);
          } catch {
            toast.error('Could not update your need');
          }
        }}
      >
        Save changes
      </Button>
    </div>
  );
}
