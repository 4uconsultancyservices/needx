'use client';

import {
  AlertCircle,
  Award,
  Box,
  Check,
  CheckCircle2,
  Cpu,
  FileText,
  Info,
  Lock,
  Package,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { ConditionGrade, ListingSpecification } from '@needx/types';
import { Badge } from '@/components/ui/badge';

interface ListingSpecificationsProps {
  specifications?: ListingSpecification;
  condition?: string;
  attributes?: Record<string, unknown>;
}

const CONDITION_METRICS: Record<
  ConditionGrade,
  { label: string; desc: string; badgeVariant: 'faith' | 'hope' | 'trust' | 'outline' | 'default'; meter: number }
> = {
  BRAND_NEW: {
    label: 'Brand New',
    desc: 'Unused, in original manufacturer packaging with seal intact.',
    badgeVariant: 'faith',
    meter: 100,
  },
  LIKE_NEW: {
    label: 'Like New',
    desc: 'Flawless cosmetic condition with no visible scratches or wear; fully tested.',
    badgeVariant: 'faith',
    meter: 95,
  },
  EXCELLENT: {
    label: 'Excellent',
    desc: 'Minimal micro-signs of use. 100% fully functional and thoroughly tested.',
    badgeVariant: 'trust',
    meter: 85,
  },
  GOOD: {
    label: 'Good Condition',
    desc: 'Normal signs of cosmetic wear consistent with careful use. All functions work perfectly.',
    badgeVariant: 'hope',
    meter: 70,
  },
  FAIR: {
    label: 'Fair / Usable',
    desc: 'Noticeable cosmetic wear, scratches or marks, but mechanically sound and operational.',
    badgeVariant: 'outline',
    meter: 50,
  },
};

export function ListingSpecificationsCard({
  specifications,
  condition,
  attributes = {},
}: ListingSpecificationsProps) {
  const grade: ConditionGrade = specifications?.conditionGrade ?? (
    condition === 'New' ? 'BRAND_NEW' : condition === 'Like New' ? 'LIKE_NEW' : 'GOOD'
  );
  const gradeInfo = CONDITION_METRICS[grade] ?? CONDITION_METRICS.GOOD;

  const accessories = specifications?.includedAccessories ?? [];
  const brand = specifications?.brand ?? (typeof attributes.brand === 'string' ? attributes.brand : undefined);
  const model = specifications?.model ?? (typeof attributes.model === 'string' ? attributes.model : undefined);
  const year = specifications?.yearOrAge ?? (typeof attributes.year === 'string' ? attributes.year : undefined);
  const dimensions = specifications?.dimensionsOrSize;
  const weight = specifications?.weight;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Box className="size-5 text-trust" />
          <h3 className="font-display text-base font-bold text-ink sm:text-lg">
            Item Specifications &amp; Features
          </h3>
        </div>
        {specifications?.serialNumberProtected && (
          <Badge variant="trust" className="text-[10px] gap-1 font-mono font-semibold">
            <Lock className="size-2.5" /> Serial Logged
          </Badge>
        )}
      </div>

      {/* Condition Meter */}
      <div className="rounded-xl border border-border/80 bg-canvas-alt/50 p-4 space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Award className="size-4 text-amber-500" />
            <span className="text-xs font-bold text-ink">Condition Rating:</span>
            <Badge variant={gradeInfo.badgeVariant} className="text-xs font-bold uppercase tracking-wider">
              {gradeInfo.label}
            </Badge>
          </div>
          <span className="font-mono text-xs font-semibold text-ink-faint">
            Health Index: {gradeInfo.meter}/100
          </span>
        </div>

        {/* Progress meter */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className={`h-full transition-all duration-500 ${
              gradeInfo.meter >= 85 ? 'bg-faith' : gradeInfo.meter >= 70 ? 'bg-trust' : 'bg-hope'
            }`}
            style={{ width: `${gradeInfo.meter}%` }}
          />
        </div>

        <p className="text-xs text-ink-soft">{specifications?.conditionNotes || gradeInfo.desc}</p>
      </div>

      {/* Specs Key-Value Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
        {brand && (
          <div className="rounded-xl border border-border/60 bg-surface p-3">
            <span className="text-[11px] text-ink-faint">Brand / Maker</span>
            <p className="mt-0.5 font-bold text-ink truncate">{brand}</p>
          </div>
        )}

        {model && (
          <div className="rounded-xl border border-border/60 bg-surface p-3">
            <span className="text-[11px] text-ink-faint">Model / Series</span>
            <p className="mt-0.5 font-bold text-ink truncate">{model}</p>
          </div>
        )}

        {year && (
          <div className="rounded-xl border border-border/60 bg-surface p-3">
            <span className="text-[11px] text-ink-faint">Year / Generation</span>
            <p className="mt-0.5 font-bold text-ink">{year}</p>
          </div>
        )}

        {dimensions && (
          <div className="rounded-xl border border-border/60 bg-surface p-3">
            <span className="text-[11px] text-ink-faint">Dimensions</span>
            <p className="mt-0.5 font-bold text-ink">{dimensions}</p>
          </div>
        )}

        {weight && (
          <div className="rounded-xl border border-border/60 bg-surface p-3">
            <span className="text-[11px] text-ink-faint">Weight</span>
            <p className="mt-0.5 font-bold text-ink">{weight}</p>
          </div>
        )}

        {/* Custom attributes */}
        {Object.entries(attributes).map(([k, v]) => {
          if (['brand', 'model', 'year'].includes(k) || typeof v !== 'string') return null;
          return (
            <div key={k} className="rounded-xl border border-border/60 bg-surface p-3">
              <span className="text-[11px] text-ink-faint capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
              <p className="mt-0.5 font-bold text-ink truncate">{v}</p>
            </div>
          );
        })}
      </div>

      {/* Included Accessories Checklist */}
      {accessories.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-trust" /> What&apos;s Included In The Box
          </h4>
          <div className="flex flex-wrap gap-2">
            {accessories.map((acc, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-lg border border-faith/20 bg-faith-soft/40 px-2.5 py-1 text-xs font-semibold text-ink"
              >
                <Check className="size-3 text-faith stroke-[2.5]" />
                {acc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Serial Number Protection Sentinel Note */}
      {specifications?.serialNumberProtected && (
        <div className="flex items-start gap-2.5 rounded-xl border border-trust/20 bg-trust-soft/20 p-3 text-xs text-ink-soft">
          <ShieldCheck className="size-4 shrink-0 mt-0.5 text-trust" />
          <span>
            <strong>Anti-Swap &amp; Theft Protection Active:</strong> This item&apos;s unique serial number is registered in NEEDX&apos;s encrypted asset tracking ledger. Serial numbers are verified during check-in and checkout to guarantee item authenticity.
          </span>
        </div>
      )}
    </div>
  );
}
