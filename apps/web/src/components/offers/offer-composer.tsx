'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import type { Need, TransactionMode } from '@needx/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateOffer } from '@/hooks/use-offers';
import { TRANSACTION_MODE_LABELS } from '@/lib/utils';

export function OfferComposer({ need, trigger }: { need: Need; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<TransactionMode>(need.modes[0] ?? 'BUY');
  const [price, setPrice] = useState(need.budget?.max ? String(need.budget.max) : '');
  const [message, setMessage] = useState('');
  const createOffer = useCreateOffer();

  const submit = async () => {
    if (!price) return;
    try {
      await createOffer.mutateAsync({
        needId: need.id,
        mode,
        price: Number(price),
        currency: 'INR',
        message: message || undefined,
        expiresInHours: 72,
      });
      toast.success('Offer sent!');
      setOpen(false);
      setMessage('');
    } catch {
      toast.error('Could not send your offer.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make an offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Transaction mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as TransactionMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {need.modes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {TRANSACTION_MODE_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Your price (₹)</Label>
            <Input type="number" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 850" />
          </div>
          <div>
            <Label>Message (optional)</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Let them know why you're a good fit..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="default" loading={createOffer.isPending} disabled={!price} onClick={submit}>
            Send offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
