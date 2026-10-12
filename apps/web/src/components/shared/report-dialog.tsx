'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCreateReport } from '@/hooks/use-misc';
import { ShieldAlert, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: 'USER' | 'LISTING' | 'NEED' | 'OFFER' | 'MESSAGE';
  targetId: string;
  targetTitle?: string;
}

const REPORT_REASONS = [
  { value: 'FAKE', label: 'Fake Profile or Impersonation', desc: 'Pretending to be someone else, false credentials, or fictitious identity' },
  { value: 'FRAUD', label: 'Fraud or Scam Attempt', desc: 'Asking for payment outside NEEDX, deposit scams, or deceptive terms' },
  { value: 'PROHIBITED', label: 'Prohibited or Dangerous Items', desc: 'Unlawful goods, counterfeit equipment, or hazardous materials' },
  { value: 'SPAM', label: 'Spam or Misleading Information', desc: 'Fake prices, repetitive ads, or fabricated listings' },
  { value: 'ABUSE', label: 'Harassment or Inappropriate Behavior', desc: 'Abusive language, threats, or unprofessional conduct' },
  { value: 'OTHER', label: 'Other Trust & Safety Violation', desc: 'Any other violation of NEEDX community safety guidelines' },
] as const;

export function ReportDialog({ open, onOpenChange, targetType, targetId, targetTitle }: ReportDialogProps) {
  const [reason, setReason] = React.useState<string>('FAKE');
  const [details, setDetails] = React.useState('');
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const createReport = useCreateReport();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // reset states after closing
      setTimeout(() => {
        setIsSubmitted(false);
        setReason('FAKE');
        setDetails('');
      }, 300);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId) return;

    try {
      await createReport.mutateAsync({
        targetType,
        targetId,
        reason,
        details: details.trim() || undefined,
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Failed to submit safety report', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        {isSubmitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-trust/10 text-trust">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold text-ink">Report Submitted</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Thank you for protecting the NEEDX community. Our Trust & Safety sentinel team has received this report
              and will take immediate action against fraudulent or fake accounts.
            </p>
            <div className="mt-6">
              <Button type="button" onClick={() => handleOpenChange(false)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-600">
                <ShieldAlert className="size-5" />
                <DialogTitle>Report {targetType === 'USER' ? 'Suspicious or Fake Profile' : 'Content'}</DialogTitle>
              </div>
              <DialogDescription>
                {targetTitle ? (
                  <>Flagging <span className="font-semibold text-ink">{targetTitle}</span> for review by NEEDX Trust & Safety.</>
                ) : (
                  'Help us protect real users by flagging fake profiles, fraudulent activity, or violations.'
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">
                  Reason for Report
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label
                      key={r.value}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors cursor-pointer ${
                        reason === r.value
                          ? 'border-rose-500 bg-rose-500/5 ring-1 ring-rose-500'
                          : 'border-border bg-canvas hover:bg-canvas-alt'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reportReason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={() => setReason(r.value)}
                        className="mt-1 size-4 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-ink">{r.label}</div>
                        <div className="text-xs text-ink-soft">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-soft mb-1.5">
                  Additional Details & Evidence (Optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Describe suspicious behaviors, external links requested, or discrepancies in identity..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Escrow Reminder:</strong> All legitimate NEEDX transactions occur within platform escrow. Never transfer UPI or cash outside NEEDX.
                </span>
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createReport.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                disabled={createReport.isPending}
              >
                {createReport.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
