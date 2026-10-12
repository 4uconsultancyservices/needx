'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Bell, LogOut, Moon, ShieldAlert, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { isUserProvider, useCurrentUser, useLogout } from '@/hooks/use-auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const { data: user } = useCurrentUser();
  const isProvider = isUserProvider(user);
  const logout = useLogout();
  const router = useRouter();
  const qc = useQueryClient();

  const becomeProvider = useMutation({
    mutationFn: (providerType: string) => api.post('/users/me/provider', { providerType }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('You are now a provider! Head to your provider dashboard to add a listing.');
    },
  });

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardContent className="space-y-4 pt-5">
          <p className="text-sm font-semibold text-ink">Appearance</p>
          <div className="flex items-center justify-between">
            <Label className="mb-0 flex items-center gap-2">
              <Moon className="size-4" /> Theme
            </Label>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 pt-5">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Bell className="size-4" /> Notifications
          </p>
          <div className="flex items-center justify-between">
            <Label className="mb-0">In-app notifications</Label>
            <Switch defaultChecked disabled />
          </div>
          <div className="flex items-center justify-between">
            <Label className="mb-0">Push notifications</Label>
            <Switch disabled />
          </div>
          <p className="text-xs text-ink-faint">Push requires enabling browser notifications — prompt appears automatically when supported.</p>
        </CardContent>
      </Card>

      {!isProvider && (
        <Card>
          <CardContent className="space-y-3 pt-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Store className="size-4" /> Become a provider
            </p>
            <p className="text-xs text-ink-soft">List products or services and start receiving offers from people who need them.</p>
            <Select onValueChange={(v) => becomeProvider.mutate(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose provider type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                <SelectItem value="BUSINESS">Business</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      <Separator />

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          onClick={async () => {
            await logout.mutateAsync();
            router.push('/');
          }}
        >
          <LogOut /> Log out
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="ghost" className="text-danger">
              <ShieldAlert /> Report a problem
            </Button>
          }
          title="Report a problem"
          description="For account or safety issues, please contact support via the Contact page — this shortcut will take you there."
          confirmLabel="Go to contact page"
          onConfirm={() => router.push('/contact')}
        />
      </div>
    </div>
  );
}
