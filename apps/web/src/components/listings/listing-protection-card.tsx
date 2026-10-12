'use client';

import { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  HelpCircle,
  Lock,
  RotateCcw,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wallet,
} from 'lucide-react';
import type { ListingProtection } from '@needx/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ListingProtectionCardProps {
  protection?: ListingProtection;
  priceAmount: number;
  depositAmount?: number;
}

export function ListingProtectionCard({ protection, priceAmount, depositAmount }: ListingProtectionCardProps) {
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [expandedSection, setExpandedSection] = useState<'damage' | 'theft' | 'deposit' | 'handover' | null>(null);

  const deposit = protection?.securityDeposit ?? depositAmount ?? 0;
  const replacementCap = protection?.replacementValue ?? priceAmount * 15;
  const plan = protection?.damageProtectionPlan ?? 'STANDARD';
  const coversDamage = protection?.coversAccidentalDamage ?? true;
  const coversTheft = protection?.coversTheftWithFIR ?? true;
  const coversBreakdown = protection?.coversMechanicalBreakdown ?? false;
  const deductible = protection?.deductiblePercent ?? 10;
  const requiresInspection = protection?.inspectionRequired ?? true;
  const requiresKYC = protection?.idVerificationRequired ?? true;

  return (
    <div className="rounded-2xl border border-trust/20 bg-gradient-to-b from-trust-soft/30 via-surface to-surface p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-trust text-white shadow-sm">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-ink sm:text-lg">
                NEEDX Trust &amp; Safety Shield
              </h3>
              <Badge variant="trust" className="text-[10px] uppercase font-bold tracking-wider">
                {plan} PROTECTION
              </Badge>
            </div>
            <p className="text-xs text-ink-soft">
              Comprehensive safety against damage, theft, non-return, and dispute risks.
            </p>
          </div>
        </div>

        <Dialog open={showProtocolModal} onOpenChange={setShowProtocolModal}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs text-trust hover:bg-trust-soft/50 font-semibold self-start sm:self-auto">
              <Scale className="size-3.5" /> Resolution Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <ShieldCheck className="size-5 text-trust" />
                NEEDX Safety &amp; Dispute Resolution Protocol
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs text-ink-soft">
              <p>
                Every transaction on NEEDX is governed by our <strong>Triple-Lock Fair Escrow &amp; Asset Protection Agreement</strong> to safeguard both the item owner and the customer:
              </p>

              <div className="space-y-3">
                <div className="rounded-xl border border-border bg-canvas-alt p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-ink">
                    <span className="flex size-5 items-center justify-center rounded-full bg-trust text-white text-[10px]">1</span>
                    Pre-Handover Inspection (Zero False Claims)
                  </div>
                  <p className="text-ink-soft pl-7">
                    Before handing over, both parties capture 6 timestamped photos in the NEEDX App (all angles + working test). This creates an immutable condition baseline so prior wear is never blamed on the seeker.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-canvas-alt p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-ink">
                    <span className="flex size-5 items-center justify-center rounded-full bg-trust text-white text-[10px]">2</span>
                    Accidental Damage Incident Reporting (24-Hour Window)
                  </div>
                  <p className="text-ink-soft pl-7">
                    If an item is accidentally dropped or damaged, report it within 24 hours of return. The security deposit is held in escrow while verified repair costs are assessed. The seeker pays only the {deductible}% deductible; the protection plan covers the remainder.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-canvas-alt p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-ink">
                    <span className="flex size-5 items-center justify-center rounded-full bg-trust text-white text-[10px]">3</span>
                    Theft, Non-Return &amp; Police FIR Recovery Fund
                  </div>
                  <p className="text-ink-soft pl-7">
                    If an item is stolen or not returned, NEEDX Asset Protection coordinates with law enforcement (automated police FIR assistance) and disburses from the Protection Fund up to the verified replacement value cap of ₹{replacementCap.toLocaleString('en-IN')}.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-canvas-alt p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-ink">
                    <span className="flex size-5 items-center justify-center rounded-full bg-trust text-white text-[10px]">4</span>
                    Automated Deposit Release
                  </div>
                  <p className="text-ink-soft pl-7">
                    When the item is returned in agreed condition, the provider confirms in the app and the ₹{deposit.toLocaleString('en-IN')} escrow deposit is immediately released to the seeker&apos;s source account within 24 hours.
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-faith-soft/40 border border-faith/20 p-3 text-[11px] text-faith-dark flex items-start gap-2">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-faith" />
                <span>
                  <strong>NEEDX Guarantee:</strong> We ensure 100% fair resolution backed by verified photographic evidence and neutral 48-hour arbitration tribunal.
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 4 Core Protection Pillars Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Pillar 1: Broken / Accidental Damage */}
        <div
          onClick={() => setExpandedSection(expandedSection === 'damage' ? null : 'damage')}
          className="cursor-pointer rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-trust/40 hover:shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-hope-soft text-hope">
                <Shield className="size-4" />
              </div>
              <span className="font-display text-xs font-bold text-ink">Accidental Damage Cover</span>
            </div>
            <span className="text-[10px] font-bold text-faith flex items-center gap-1">
              {coversDamage ? 'Protected' : 'Standard'}
              {expandedSection === 'damage' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </span>
          </div>

          <p className="text-xs text-ink-soft">
            Accidental drops, cracked glass &amp; liquid spills covered with a fair {deductible}% deductible.
          </p>

          {expandedSection === 'damage' && (
            <div className="mt-2 pt-2 border-t border-border/60 text-[11px] text-ink-faint space-y-1">
              <p>• Certified repair center billing directly honored</p>
              <p>• No out-of-pocket charges beyond the {deductible}% deductible cap</p>
              <p>• Normal cosmetic wear &amp; tear is completely exempt</p>
            </div>
          )}
        </div>

        {/* Pillar 2: Theft & Loss Protection */}
        <div
          onClick={() => setExpandedSection(expandedSection === 'theft' ? null : 'theft')}
          className="cursor-pointer rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-trust/40 hover:shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-danger-soft text-danger">
                <Lock className="size-4" />
              </div>
              <span className="font-display text-xs font-bold text-ink">Theft &amp; Non-Return Shield</span>
            </div>
            <span className="text-[10px] font-bold text-faith flex items-center gap-1">
              Up to ₹{replacementCap.toLocaleString('en-IN')}
              {expandedSection === 'theft' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </span>
          </div>

          <p className="text-xs text-ink-soft">
            Full replacement cap protection if stolen or unreturned, backed by verified FIR support.
          </p>

          {expandedSection === 'theft' && (
            <div className="mt-2 pt-2 border-t border-border/60 text-[11px] text-ink-faint space-y-1">
              <p>• Police FIR filing assistance provided by NEEDX Legal Desk</p>
              <p>• Replacement value cap: ₹{replacementCap.toLocaleString('en-IN')}</p>
              <p>• Serial number registered in anti-theft asset registry</p>
            </div>
          )}
        </div>

        {/* Pillar 3: Security Deposit Escrow Hold */}
        <div
          onClick={() => setExpandedSection(expandedSection === 'deposit' ? null : 'deposit')}
          className="cursor-pointer rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-trust/40 hover:shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-faith-soft text-faith">
                <Wallet className="size-4" />
              </div>
              <span className="font-display text-xs font-bold text-ink">Escrow Security Deposit</span>
            </div>
            <span className="text-[10px] font-bold text-ink flex items-center gap-1">
              {deposit > 0 ? `₹${deposit.toLocaleString('en-IN')}` : 'Zero Deposit'}
              {expandedSection === 'deposit' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </span>
          </div>

          <p className="text-xs text-ink-soft">
            Held safely in platform escrow; automatically refunded within 24h of safe return.
          </p>

          {expandedSection === 'deposit' && (
            <div className="mt-2 pt-2 border-t border-border/60 text-[11px] text-ink-faint space-y-1">
              <p>• Provider never touches deposit directly; kept in neutral escrow</p>
              <p>• Cannot be deducted without verified mutual photo inspection</p>
              <p>• 100% refund guarantee upon undamaged return</p>
            </div>
          )}
        </div>

        {/* Pillar 4: Handover Condition Checklist */}
        <div
          onClick={() => setExpandedSection(expandedSection === 'handover' ? null : 'handover')}
          className="cursor-pointer rounded-xl border border-border bg-surface p-3.5 transition-all hover:border-trust/40 hover:shadow-xs space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-trust-soft text-trust">
                <Camera className="size-4" />
              </div>
              <span className="font-display text-xs font-bold text-ink">Handover Photo Check-in</span>
            </div>
            <span className="text-[10px] font-bold text-faith flex items-center gap-1">
              {requiresInspection ? 'Mandatory' : 'Recommended'}
              {expandedSection === 'handover' ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
            </span>
          </div>

          <p className="text-xs text-ink-soft">
            6-angle timestamped photo inspection checklist at pickup &amp; return prevents fraudulent claims.
          </p>

          {expandedSection === 'handover' && (
            <div className="mt-2 pt-2 border-t border-border/60 text-[11px] text-ink-faint space-y-1">
              <p>• Captures all sides, screen/optics, and included accessories</p>
              <p>• Both parties digitally sign off before keys/item are released</p>
              <p>• Instant photographic proof in case of any dispute</p>
            </div>
          )}
        </div>
      </div>

      {/* Safety Sentinel Verification Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-canvas-alt/70 p-3 text-xs border border-border/60">
        <div className="flex items-center gap-2">
          {requiresKYC ? (
            <div className="flex items-center gap-1.5 font-semibold text-faith">
              <UserCheck className="size-4 text-faith" />
              <span>Government KYC &amp; Phone Verified Seekers Only</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-ink-soft">
              <ShieldCheck className="size-4 text-trust" />
              <span>Open to all verified NEEDX members</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-ink-faint">
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> 24h claim window
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw className="size-3" /> Fast dispute tribunal
          </span>
        </div>
      </div>
    </div>
  );
}
