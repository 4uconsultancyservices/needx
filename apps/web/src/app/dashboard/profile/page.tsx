'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Crown, Store, User as UserIcon, Navigation, Loader2 } from 'lucide-react';
import { isUserAdmin, isUserProvider, useCurrentUser, useLogout } from '@/hooks/use-auth';
import { useUserLocation } from '@/contexts/location-context';
import { api } from '@/lib/api-client';
import { INDIAN_CITIES } from '@/lib/constants';
import { initials } from '@/lib/utils';
import type { UpdateProfileInput } from '@needx/validation';

export default function ProfilePage() {
  const { data: user } = useCurrentUser();
  const { isDetecting, detectGpsLocation } = useUserLocation();
  const isProvider = isUserProvider(user);
  const isAdmin = isUserAdmin(user);
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setBio(user.bio ?? '');
      setCity(user.city ?? '');
    }
  }, [user]);

  const update = useMutation({
    mutationFn: (input: UpdateProfileInput) => api.patch('/users/me', input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile updated');
    },
  });

  if (!user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={user.avatarUrl} alt={user.name} />
          <AvatarFallback className="text-lg">{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-ink">{user.name}</p>
          <p className="text-sm text-ink-faint">{user.email}</p>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {isAdmin && (
              <span className="inline-flex items-center gap-1 rounded bg-[#0f294a] px-2 py-0.5 text-xs font-bold text-dawn uppercase tracking-wider">
                <Crown className="size-3 text-dawn" /> Admin Operator
              </span>
            )}
            {isProvider ? (
              <span className="inline-flex items-center gap-1 rounded bg-hope-soft px-2 py-0.5 text-xs font-semibold text-hope">
                <Store className="size-3" /> Verified Provider
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded bg-faith-soft px-2 py-0.5 text-xs font-medium text-faith">
                <UserIcon className="size-3" /> Community Seeker
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Full name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Bio</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} placeholder="Tell people a bit about yourself..." />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label>City</Label>
            <button
              type="button"
              onClick={async () => {
                const detected = await detectGpsLocation();
                if (detected) setCity(detected.cityName);
              }}
              disabled={isDetecting}
              className="inline-flex items-center gap-1 text-xs font-semibold text-trust hover:underline cursor-pointer"
            >
              {isDetecting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Navigation className="size-3.5" />
              )}
              <span>{isDetecting ? 'Detecting GPS...' : 'Detect Current City'}</span>
            </button>
          </div>
          <Select value={city || undefined} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a city" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_CITIES.map((c) => (
                <SelectItem key={c.name} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="default" loading={update.isPending} onClick={() => update.mutate({ name, bio, city })}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
