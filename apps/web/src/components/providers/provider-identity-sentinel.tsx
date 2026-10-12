'use client';

import * as React from 'react';
import type { TrustInfo, ProviderProfile } from '@needx/types';
import {
  ShieldCheck,
  ShieldAlert,
  Phone,
  Mail,
  Building2,
  FileCheck,
  Lock,
  Flag,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportDialog } from '@/components/shared/report-dialog';

interface ProviderIdentitySentinelProps {
  userId: string;
  userName: string;
  trust: TrustInfo;
  provider?: ProviderProfile;
  isBanned?: boolean;
}

export function ProviderIdentitySentinel({
  userId,
  userName,
  trust,
  provider,
  isBanned,
}: ProviderIdentitySentinelProps) {
  const [reportOpen, setReportOpen] = React.useState(false);

  // Compute overall authenticity score
  let score = 50;
  if (trust.identityVerified) score += 20;
  if (trust.phoneVerified) score += 10;
  if (trust.emailVerified) score += 5;
  if (trust.businessVerified) score += 10;
  if (trust.completedTransactions >= 10) score += 5;
  const authenticityScore = Math.min(99, score);

  return (
    <div className="space-y-4">
      {/* If Account is Suspended/Banned */}
      {isBanned && (
        <div className="rounded-2xl border-2 border-rose-500/30 bg-rose-500/10 p-5 text-rose-800 dark:text-rose-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="size-6 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <h3 className="font-display font-semibold text-rose-700 dark:text-rose-300">
                Account Suspended by Trust & Safety
              </h3>
              <p className="mt-1 text-sm text-rose-600/90 dark:text-rose-300/90">
                This account has been flagged and suspended for safety violations or fraudulent suspicion.
                New transactions and messaging are completely disabled with this profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Authenticity & Sentinel Card */}
      <div className="card-surface overflow-hidden border border-border/80 shadow-sm">
        <div className="border-b border-border/80 bg-gradient-to-r from-trust/5 via-hope/5 to-transparent px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-trust/15 text-trust shadow-sm">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">
                  Real User & Identity Verification Sentinel
                </h3>
                <p className="text-xs text-ink-soft">
                  Strict KYC & anti-fraud verification checks performed by NEEDX Trust
                </p>
              </div>
            </div>

            {/* Authenticity Index Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto rounded-full bg-trust/10 px-3.5 py-1 text-xs font-medium text-trust">
              <span className="size-2 rounded-full bg-trust animate-pulse" />
              Trust Score: <strong className="font-semibold">{authenticityScore}% Verified</strong>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Verification Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {/* Government ID / Aadhaar KYC */}
            <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas/60 p-3.5 transition-colors hover:border-trust/40">
              <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                trust.identityVerified ? 'bg-trust/10 text-trust' : 'bg-canvas-alt text-ink-faint'
              }`}>
                <FileCheck className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span>Government ID / Aadhaar</span>
                  {trust.identityVerified ? (
                    <CheckCircle2 className="size-3.5 text-trust" />
                  ) : (
                    <XCircle className="size-3.5 text-ink-faint" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {trust.identityVerified
                    ? 'Official citizen identity & liveness matched'
                    : 'Pending manual government KYC'}
                </p>
              </div>
            </div>

            {/* Phone & 2FA OTP */}
            <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas/60 p-3.5 transition-colors hover:border-trust/40">
              <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                trust.phoneVerified ? 'bg-trust/10 text-trust' : 'bg-canvas-alt text-ink-faint'
              }`}>
                <Phone className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span>Phone Number (2FA OTP)</span>
                  {trust.phoneVerified ? (
                    <CheckCircle2 className="size-3.5 text-trust" />
                  ) : (
                    <XCircle className="size-3.5 text-ink-faint" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {trust.phoneVerified
                    ? 'Active mobile verified via SMS OTP'
                    : 'Phone verification in progress'}
                </p>
              </div>
            </div>

            {/* Business Registry / Peer Verification */}
            <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas/60 p-3.5 transition-colors hover:border-trust/40">
              <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                trust.businessVerified ? 'bg-faith/10 text-faith' : 'bg-trust/10 text-trust'
              }`}>
                <Building2 className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span>{trust.businessVerified ? 'Commercial Enterprise' : 'Peer Provider'}</span>
                  {trust.businessVerified ? (
                    <CheckCircle2 className="size-3.5 text-faith" />
                  ) : (
                    <CheckCircle2 className="size-3.5 text-trust" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {trust.businessVerified
                    ? 'Registered business & tax credentials confirmed'
                    : 'Verified community peer lender'}
                </p>
              </div>
            </div>

            {/* Email Verification */}
            <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas/60 p-3.5 transition-colors hover:border-trust/40">
              <div className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${
                trust.emailVerified ? 'bg-trust/10 text-trust' : 'bg-canvas-alt text-ink-faint'
              }`}>
                <Mail className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span>Email Channel</span>
                  {trust.emailVerified ? (
                    <CheckCircle2 className="size-3.5 text-trust" />
                  ) : (
                    <XCircle className="size-3.5 text-ink-faint" />
                  )}
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {trust.emailVerified ? 'Primary inbox verified' : 'Unverified mailbox'}
                </p>
              </div>
            </div>

            {/* NEEDX Escrow Vault Protection */}
            <div className="flex items-start gap-3 rounded-xl border border-border bg-canvas/60 p-3.5 transition-colors hover:border-trust/40 sm:col-span-2">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-hope/10 text-hope">
                <Lock className="size-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span>NEEDX Escrow Protection Enabled</span>
                  <CheckCircle2 className="size-3.5 text-hope" />
                </div>
                <p className="mt-0.5 text-xs text-ink-soft">
                  100% of rental payments and security deposits are safeguarded in platform escrow until physical inspection handover is approved.
                </p>
              </div>
            </div>
          </div>

          {/* Anti-Scam Safeguard Notice & Fake Profile Reporting */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs">
            <div className="flex items-start gap-3 text-amber-900 dark:text-amber-200">
              <AlertCircle className="size-4.5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong className="font-semibold text-amber-950 dark:text-amber-100">
                  Anti-Fraud Protection Policy:
                </strong>{' '}
                Never pay providers directly through external links, private QR codes, or off-platform UPI. Doing so voids all escrow protection and theft/damage coverage.
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReportOpen(true)}
              className="shrink-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900/50"
            >
              <Flag className="mr-1.5 size-3.5 text-rose-500" />
              Report Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Safety Report Dialog */}
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        targetType="USER"
        targetId={userId}
        targetTitle={userName}
      />
    </div>
  );
}
