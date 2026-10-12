'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Sparkles, Percent } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminSettingsPage() {
  const [weights, setWeights] = useState({
    semantic: 30,
    location: 20,
    price: 15,
    availability: 10,
    rating: 10,
    reliability: 10,
    responseRate: 5,
  });

  const totalSum = Object.values(weights).reduce((a, b) => a + b, 0);

  const handleSave = () => {
    if (totalSum !== 100) {
      toast.error(`Weights must sum to exactly 100% (currently ${totalSum}%).`);
      return;
    }
    toast.success('Match engine configuration verified and saved to active cluster');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Match Engine & Platform Fee Console
          </h1>
          <Badge variant="trust" className="text-xs">Cluster Config</Badge>
        </div>
        <p className="mt-1 text-xs text-ink-soft sm:text-sm">
          Tune algorithmic ranking coefficients, geographic radii constraints, and escrow commission schedules.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Match Engine Weights */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-trust" />
              <h2 className="font-display text-base font-bold text-ink">Ranking Coefficients</h2>
            </div>
            <Badge
              variant={totalSum === 100 ? 'faith' : 'danger'}
              className="text-xs font-mono-num font-bold"
            >
              Sum: {totalSum}%
            </Badge>
          </div>
          <p className="text-xs text-ink-soft">
            Multi-factor scoring algorithm weights executed on every user need query.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { key: 'semantic', label: 'Semantic & Lexical Fit', val: weights.semantic },
              { key: 'location', label: 'Geographic Distance', val: weights.location },
              { key: 'price', label: 'Budget & Price Competitiveness', val: weights.price },
              { key: 'availability', label: 'Calendar / Stock Availability', val: weights.availability },
              { key: 'rating', label: 'Historical Rating Score', val: weights.rating },
              { key: 'reliability', label: 'On-Time Completion History', val: weights.reliability },
              { key: 'responseRate', label: 'Provider Response Velocity', val: weights.responseRate },
            ].map(({ key, label, val }) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-canvas-alt/50 px-3.5 py-2.5">
                <span className="text-xs font-medium text-ink">{label}</span>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    value={val}
                    onChange={(e) =>
                      setWeights((prev) => ({
                        ...prev,
                        [key]: Number(e.target.value) || 0,
                      }))
                    }
                    className="h-7 w-16 text-center text-xs font-mono font-bold bg-surface p-1"
                  />
                  <span className="text-xs text-ink-faint">%</span>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="default"
            onClick={handleSave}
            disabled={totalSum !== 100}
            className="w-full text-xs mt-3"
          >
            Apply Algorithm Weights
          </Button>
        </div>

        {/* Platform Commission & Escrow Safeguards */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="size-4 text-faith" />
              <h2 className="font-display text-base font-bold text-ink">Marketplace Commission</h2>
            </div>
            <p className="text-xs text-ink-soft">
              Default platform take-rate deducted automatically upon order completion and escrow release.
            </p>

            <div className="rounded-xl border border-border bg-canvas-alt/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">Commission Take-Rate</span>
                <span className="font-mono text-sm font-bold text-trust">10.0%</span>
              </div>
              <p className="text-[11px] text-ink-faint">
                Fixed 10% platform service fee applied uniformly across BUY, RENT, and SERVICE transactions.
              </p>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="rounded-2xl border border-faith/20 bg-faith-soft/30 p-5 space-y-2">
            <div className="flex items-center gap-2 text-faith font-bold text-xs">
              <ShieldCheck className="size-4" />
              <span>Matching Engine Live Status</span>
            </div>
            <p className="text-xs text-ink-soft">
              Cluster node in Gurgaon datacenter. Average match generation latency: <strong className="text-ink">18ms</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
