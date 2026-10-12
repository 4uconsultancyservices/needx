'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { isUserProvider, useCurrentUser } from '@/hooks/use-auth';
import { api } from '@/lib/api-client';
import type { BecomeProviderInput } from '@needx/validation';

export default function ProviderSettingsPage() {
  const { data: user } = useCurrentUser();
  const isProvider = isUserProvider(user);
  const qc = useQueryClient();
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user?.provider) {
      setBusinessName(user.provider.businessName ?? '');
      setDescription(user.provider.description ?? '');
    }
  }, [user]);

  const update = useMutation({
    mutationFn: (input: Partial<BecomeProviderInput>) =>
      api.post('/users/me/provider', { providerType: user?.provider?.providerType ?? 'INDIVIDUAL', ...input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Provider profile updated');
    },
  });

  if (!user || !isProvider) return null;

  return (
    <Card className="max-w-xl">
      <CardContent className="space-y-4 pt-5">
        <div>
          <Label>Provider type</Label>
          <Input value={user.provider?.providerType ?? 'INDIVIDUAL'} disabled />
        </div>
        <div>
          <Label>Business / display name</Label>
          <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>
        <Button variant="default" loading={update.isPending} onClick={() => update.mutate({ businessName, description })}>
          Save changes
        </Button>
      </CardContent>
    </Card>
  );
}
