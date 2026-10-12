'use client';

import { useState } from 'react';
import { Check, MapPin, Navigation, Package2, Pencil, Wallet, Loader2 } from 'lucide-react';
import type { ParsedNeedPreview, Category } from '@needx/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { INDIAN_CITIES, TRANSACTION_MODES } from '@/lib/constants';
import { TRANSACTION_MODE_LABELS, cn } from '@/lib/utils';
import { useUserLocation } from '@/contexts/location-context';

export interface NeedDraft {
  title: string;
  description: string;
  categoryId?: string;
  modes: string[];
  budgetMax?: number;
  quantity: number;
  cityName: string;
  state?: string;
  locality?: string;
  coordinates?: [number, number];
  addressLabel?: string;
}

function matchCity(label?: string): string {
  if (!label) return '';
  const found = INDIAN_CITIES.find((c) => label.toLowerCase().includes(c.name.toLowerCase()));
  return found?.name ?? '';
}

export function NeedPreviewCard({
  preview,
  categories,
  rawText,
  onPost,
  posting,
}: {
  preview: ParsedNeedPreview;
  categories: Category[];
  rawText: string;
  onPost: (draft: NeedDraft) => void;
  posting: boolean;
}) {
  const { location: activeLocation, isDetecting, detectGpsLocation } = useUserLocation();
  const [editing, setEditing] = useState(false);
  const matchedCity = matchCity(preview.locationLabel);
  const defaultCity = matchedCity || activeLocation.cityName;

  const [draft, setDraft] = useState<NeedDraft>({
    title: preview.title,
    description: rawText,
    categoryId: preview.categoryId,
    modes: preview.modes,
    budgetMax: preview.budget?.max,
    quantity: preview.quantity ?? 1,
    cityName: defaultCity,
    state: activeLocation.state,
    locality: activeLocation.locality,
    coordinates: activeLocation.lat && activeLocation.lng ? [activeLocation.lng, activeLocation.lat] : undefined,
    addressLabel: activeLocation.addressLabel,
  });

  const handleDetectGPS = async () => {
    const detected = await detectGpsLocation();
    if (detected) {
      setDraft((d) => ({
        ...d,
        cityName: detected.cityName,
        state: detected.state,
        locality: detected.locality,
        coordinates: [detected.lng, detected.lat],
        addressLabel: detected.addressLabel,
      }));
    }
  };

  const category = categories.find((c) => c.id === draft.categoryId);

  return (
    <Card className="animate-fade-up">
      <CardContent className="pt-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">We understood</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-faint">Confidence</span>
            <Progress value={preview.confidence * 100} className="w-16" />
          </div>
        </div>

        {!editing ? (
          <>
            <h2 className="font-display text-xl font-semibold text-ink">{draft.title}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.modes.map((m) => (
                <Badge key={m} variant="hope">
                  {TRANSACTION_MODE_LABELS[m]}
                </Badge>
              ))}
              {category && (
                <Badge variant="outline">
                  <Package2 className="mr-1 size-3" /> {category.name}
                </Badge>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-1.5 text-ink-soft">
                <Wallet className="size-4 text-ink-faint" />
                {draft.budgetMax ? `Up to ₹${draft.budgetMax.toLocaleString('en-IN')}` : 'No budget set'}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-canvas/60 px-2.5 py-1.5 border border-border/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin className="size-4 text-trust shrink-0" />
                  <span className="truncate text-xs font-medium text-ink">
                    {draft.locality ? `${draft.locality}, ${draft.cityName}` : draft.cityName || 'Location not detected'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isDetecting}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-trust hover:underline cursor-pointer shrink-0 ml-2"
                  title="Detect and use current device location"
                >
                  {isDetecting ? (
                    <Loader2 className="size-3 animate-spin text-trust" />
                  ) : (
                    <Navigation className="size-3 text-trust" />
                  )}
                  <span>{isDetecting ? 'Detecting...' : 'Use GPS'}</span>
                </button>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil /> Edit
              </Button>
              <Button variant="hope" loading={posting} disabled={!draft.cityName} onClick={() => onPost(draft)} className="flex-1">
                <Check /> Post need
              </Button>
            </div>
            {!draft.cityName && <p className="mt-2 text-xs text-danger">Pick a city before posting — edit to set one.</p>}
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={3} />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={draft.categoryId ?? 'none'} onValueChange={(v) => setDraft((d) => ({ ...d, categoryId: v === 'none' ? undefined : v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transaction modes</Label>
              <div className="flex flex-wrap gap-2">
                {TRANSACTION_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        modes: d.modes.includes(m) ? d.modes.filter((x) => x !== m) : [...d.modes, m],
                      }))
                    }
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                      draft.modes.includes(m) ? 'border-hope bg-hope text-white shadow-xs' : 'border-border bg-surface text-ink-soft hover:bg-canvas-alt',
                    )}
                  >
                    {TRANSACTION_MODE_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Budget (max ₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={draft.budgetMax ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, budgetMax: e.target.value ? Number(e.target.value) : undefined }))}
                />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={draft.quantity}
                  onChange={(e) => setDraft((d) => ({ ...d, quantity: Math.max(1, Number(e.target.value) || 1) }))}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label>Location</Label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isDetecting}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-trust hover:underline cursor-pointer"
                >
                  {isDetecting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Navigation className="size-3.5" />
                  )}
                  <span>{isDetecting ? 'Detecting GPS...' : 'Use Current Device Location'}</span>
                </button>
              </div>
              <Select
                value={draft.cityName || undefined}
                onValueChange={(v) => {
                  const city = INDIAN_CITIES.find((c) => c.name === v);
                  setDraft((d) => ({
                    ...d,
                    cityName: v,
                    state: city?.state,
                    locality: undefined,
                    coordinates: city ? [city.lng, city.lat] : undefined,
                    addressLabel: city ? `${city.name}, ${city.state}` : v,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a city" />
                </SelectTrigger>
                <SelectContent>
                  {INDIAN_CITIES.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      {c.name}, {c.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {draft.locality && (
                <p className="mt-1.5 text-[11px] text-ink-soft flex items-center gap-1">
                  <MapPin className="size-3 text-trust" />
                  <span>Area: <strong>{draft.locality}</strong></span>
                </p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                Done editing
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
