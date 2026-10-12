'use client';

import {
  AlertCircle,
  Building,
  Calendar,
  Clock,
  HelpCircle,
  Info,
  MapPin,
  Package,
  RotateCcw,
  Truck,
  UserCheck,
} from 'lucide-react';
import type { CancellationPolicy, HandoverOption, ListingRentalTerms } from '@needx/types';
import { Badge } from '@/components/ui/badge';

interface ListingRentalTermsCardProps {
  terms?: ListingRentalTerms;
  depositAmount?: number;
}

const CANCELLATION_INFO: Record<CancellationPolicy, { label: string; desc: string }> = {
  FLEXIBLE: {
    label: 'Flexible Cancellation',
    desc: 'Free full cancellation up to 24 hours before the handover start time.',
  },
  MODERATE: {
    label: 'Moderate Policy',
    desc: 'Free cancellation up to 48 hours prior; 50% refund thereafter.',
  },
  STRICT: {
    label: 'Strict Policy',
    desc: 'Cancellations within 5 days of start date forfeit 50% of rental fee.',
  },
};

const HANDOVER_LABELS: Record<HandoverOption, { label: string; desc: string; icon: any }> = {
  LOCAL_PICKUP: {
    label: 'Free Local Pickup',
    desc: 'Meet at provider hub or designated community pickup point',
    icon: MapPin,
  },
  DOORSTEP_DELIVERY: {
    label: 'Doorstep Delivery',
    desc: 'Convenient delivery directly to your home or office address',
    icon: Truck,
  },
  SHIPPING: {
    label: 'Tracked Courier / Shipping',
    desc: 'Insured parcel delivery with tracking number',
    icon: Package,
  },
};

export function ListingRentalTermsCard({ terms, depositAmount }: ListingRentalTermsCardProps) {
  const minDays = terms?.minRentalDays ?? 1;
  const maxDays = terms?.maxRentalDays ?? 30;
  const policy = terms?.cancellationPolicy ?? 'FLEXIBLE';
  const policyInfo = CANCELLATION_INFO[policy];
  const handoverOptions = terms?.handoverOptions ?? ['LOCAL_PICKUP'];
  const deliveryFee = terms?.deliveryFee ?? 0;
  const lateFee = terms?.lateFeePerDay ?? 0;
  const guidelines = terms?.usageGuidelines;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-trust" />
          <h3 className="font-display text-base font-bold text-ink sm:text-lg">
            Rental Terms &amp; Handover Protocol
          </h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {policyInfo.label}
        </Badge>
      </div>

      {/* Handover Methods */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
          Handover &amp; Return Methods
        </h4>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {handoverOptions.map((opt) => {
            const item = HANDOVER_LABELS[opt];
            if (!item) return null;
            const Icon = item.icon;
            return (
              <div
                key={opt}
                className="flex items-start gap-3 rounded-xl border border-border/80 bg-canvas-alt/40 p-3 text-xs"
              >
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface border border-border text-trust">
                  <Icon className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">{item.label}</span>
                    {opt === 'DOORSTEP_DELIVERY' && deliveryFee > 0 && (
                      <span className="text-[10px] font-semibold text-faith">
                        +₹{deliveryFee.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-soft">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Rules & Buffer Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
        <div className="rounded-xl border border-border/60 bg-surface p-3 space-y-0.5">
          <span className="text-[11px] text-ink-faint">Min Rental Duration</span>
          <p className="font-bold text-ink">
            {minDays} {minDays === 1 ? 'Day' : 'Days'}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-surface p-3 space-y-0.5">
          <span className="text-[11px] text-ink-faint">Max Rental Window</span>
          <p className="font-bold text-ink">{maxDays} Days</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-surface p-3 space-y-0.5">
          <span className="text-[11px] text-ink-faint">Late Return Fee</span>
          <p className="font-bold text-ink">
            {lateFee > 0 ? `₹${lateFee}/day` : 'Standard 1x daily rate'}
          </p>
        </div>
      </div>

      {/* Cancellation Policy Detail */}
      <div className="rounded-xl border border-border/80 bg-canvas-alt/50 p-3.5 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-ink">
          <RotateCcw className="size-3.5 text-trust" />
          <span>Cancellation Policy: {policyInfo.label}</span>
        </div>
        <p className="text-ink-soft">{policyInfo.desc}</p>
      </div>

      {/* Usage Guidelines */}
      {guidelines && (
        <div className="rounded-xl border border-border/80 bg-canvas-alt/30 p-3.5 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-ink">
            <Info className="size-3.5 text-trust" />
            <span>Provider Usage Guidelines &amp; House Rules</span>
          </div>
          <p className="whitespace-pre-line text-ink-soft text-[11px]">{guidelines}</p>
        </div>
      )}
    </div>
  );
}
