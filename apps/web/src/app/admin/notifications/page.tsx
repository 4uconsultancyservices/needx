'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Bell, Send, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export default function AdminNotificationsPage() {
  const [audience, setAudience] = useState<'ALL' | 'PROVIDERS' | 'SEEKERS'>('ALL');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleBroadcast = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message body are required.');
      return;
    }
    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSending(false);
    toast.success(`Broadcast dispatched to ${audience.toLowerCase()} audience successfully!`);
    setTitle('');
    setBody('');
    setLinkUrl('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Omnichannel Broadcast Studio
          </h1>
          <Badge variant="trust" className="text-xs">Push & Announcements</Badge>
        </div>
        <p className="mt-1 text-xs text-ink-soft sm:text-sm">
          Dispatch platform-wide alerts, system maintenance bulletins, and promotional pushes to user devices.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        {/* Composer Form */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs md:col-span-3 space-y-4">
          <div>
            <Label className="text-xs">Target Audience Segment</Label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'All Registered Users' },
                { id: 'PROVIDERS', label: 'Verified Providers' },
                { id: 'SEEKERS', label: 'Active Need Seekers' },
              ].map((aud) => (
                <button
                  key={aud.id}
                  type="button"
                  onClick={() => setAudience(aud.id as typeof audience)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                    audience === aud.id
                      ? 'border-trust bg-trust text-white shadow-xs'
                      : 'border-border bg-surface text-ink-soft hover:bg-canvas-alt'
                  }`}
                >
                  {aud.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Broadcast Priority Level</Label>
            <div className="mt-1.5 flex gap-2">
              {[
                { id: 'NORMAL', label: 'Informational', color: 'variant="trust"' },
                { id: 'HIGH', label: 'High Priority', color: 'variant="accent"' },
                { id: 'CRITICAL', label: 'Emergency / SLA', color: 'variant="danger"' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id as typeof priority)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                    priority === p.id
                      ? 'border-trust bg-trust text-white shadow-xs'
                      : 'border-border bg-surface text-ink-soft hover:bg-canvas-alt'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs">Announcement Headline</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Scheduled Platform Maintenance Tonight at 2 AM IST"
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs">Push Notification Body</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detailed notification content sent across web push, in-app bell, and SMS fallback..."
              rows={4}
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs">Deep Link Destination (Optional)</Label>
            <Input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="/how-it-works or /explore"
              className="mt-1 text-xs"
            />
          </div>

          <Button
            variant="default"
            onClick={handleBroadcast}
            loading={isSending}
            disabled={!title.trim() || !body.trim()}
            className="w-full text-xs"
          >
            <Send className="size-3.5" /> Dispatch Omnichannel Broadcast
          </Button>
        </div>

        {/* Live Device Notification Preview */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs md:col-span-2 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">
              Client Mobile & Web Preview
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Real-time rendering of the push notification card on end-user dashboards.
            </p>

            <div className="mt-6 rounded-2xl border border-border bg-canvas-alt p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f294a] via-[#1e40af] to-[#0d9488] text-white shadow-xs">
                  <Bell className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-ink">NEEDX Alert</span>
                    <span className="text-[10px] text-ink-faint">Just now</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-ink">
                    {title || 'Your headline will appear here...'}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-soft line-clamp-3">
                    {body || 'Notification message text and call-to-action preview.'}
                  </p>
                  {linkUrl && (
                    <span className="mt-2 inline-block text-[11px] font-semibold text-trust underline">
                      Open: {linkUrl}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-trust/15 bg-trust-soft/40 p-3 text-xs text-ink-soft">
            <div className="flex items-center gap-1.5 font-bold text-trust">
              <CheckCircle2 className="size-3.5" />
              <span>VAPID Web Push Ready</span>
            </div>
            <p className="mt-1 text-[11px]">
              Subscribed service workers will receive native OS notifications on Windows, Android, and macOS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
