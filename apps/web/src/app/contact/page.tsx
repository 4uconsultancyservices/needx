'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Mail, MessageSquare } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:py-20">
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">Contact us</h1>
      <p className="mt-3 text-sm text-ink-soft">
        Questions, safety concerns, or feedback — we read everything. For urgent trust &amp; safety issues, use the
        Report option directly on the relevant listing, need, or user profile so it reaches moderators fastest.
      </p>

      {sent ? (
        <div className="card-surface mt-8 flex items-center gap-3 p-5">
          <MessageSquare className="size-5 text-signal" />
          <p className="text-sm text-ink">Thanks — this demo doesn&apos;t wire up outbound email, but in production this would reach our support inbox.</p>
        </div>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success('Message sent');
          }}
        >
          <div>
            <Label>Name</Label>
            <Input required />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" required />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea required rows={5} />
          </div>
          <Button type="submit" variant="default">
            <Mail /> Send message
          </Button>
        </form>
      )}
    </div>
  );
}
