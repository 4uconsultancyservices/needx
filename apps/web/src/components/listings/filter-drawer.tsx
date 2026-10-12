'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TRANSACTION_MODES } from '@/lib/constants';
import { TRANSACTION_MODE_LABELS } from '@/lib/utils';
import type { ListingSearchQuery } from '@needx/validation';
import type { Category } from '@needx/types';

export interface ListingFilters {
  categoryId?: string;
  mode?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: ListingSearchQuery['sort'];
}

export function FilterDrawer({
  categories,
  filters,
  onApply,
}: {
  categories: Category[];
  filters: ListingFilters;
  onApply: (filters: ListingFilters) => void;
}) {
  const [draft, setDraft] = useState<ListingFilters>(filters);
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal /> Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="sm:mx-auto sm:max-w-md sm:rounded-card">
        <SheetTitle>Filters</SheetTitle>
        <div className="mt-4 space-y-4">
          <div>
            <Label>Category</Label>
            <Select value={draft.categoryId ?? 'all'} onValueChange={(v) => setDraft((d) => ({ ...d, categoryId: v === 'all' ? undefined : v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Any category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any category</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Transaction mode</Label>
            <Select value={draft.mode ?? 'all'} onValueChange={(v) => setDraft((d) => ({ ...d, mode: v === 'all' ? undefined : v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Any mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any mode</SelectItem>
                {TRANSACTION_MODES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {TRANSACTION_MODE_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Min price</Label>
              <Input type="number" inputMode="numeric" placeholder="₹0" value={draft.minPrice ?? ''} onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))} />
            </div>
            <div>
              <Label>Max price</Label>
              <Input type="number" inputMode="numeric" placeholder="Any" value={draft.maxPrice ?? ''} onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>Sort by</Label>
            <Select value={draft.sort ?? 'relevance'} onValueChange={(v) => setDraft((d) => ({ ...d, sort: v as ListingFilters['sort'] }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price_asc">Price: low to high</SelectItem>
                <SelectItem value="price_desc">Price: high to low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setDraft({})}>
            Reset
          </Button>
          <Button
            variant="default"
            className="flex-1"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}
          >
            Apply filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
