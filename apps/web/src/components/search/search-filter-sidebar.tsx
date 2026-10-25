'use client';

import { Check, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { Category } from '@needx/types';

export interface SearchFilters {
  category?: string;
  mode?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}

interface SearchFilterSidebarProps {
  categories?: Category[];
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onReset: () => void;
  activeCount: number;
}

const MODES = [
  { value: 'ALL', label: 'All Modes' },
  { value: 'RENT', label: 'Rent' },
  { value: 'BUY', label: 'Buy' },
  { value: 'SERVICE', label: 'Service / Hire' },
  { value: 'BORROW', label: 'Borrow' },
];

const PRICE_PRESETS = [
  { label: 'Under ₹1,000', min: undefined, max: 1000 },
  { label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { label: '₹5,000 – ₹20,000', min: 5000, max: 20000 },
  { label: '₹20,000+', min: 20000, max: undefined },
];

export function SearchFilterSidebar({
  categories = [],
  filters,
  onChange,
  onReset,
  activeCount,
}: SearchFilterSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-trust" />
          <h2 className="font-display text-sm font-bold text-ink uppercase tracking-wider">Filters</h2>
          {activeCount > 0 && (
            <Badge variant="trust" className="text-[10px] px-1.5 py-0">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-ink-soft hover:text-hope cursor-pointer transition-colors"
          >
            <RotateCcw className="size-3" />
            Reset
          </button>
        )}
      </div>

      {/* Transaction Mode */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Transaction Mode</label>
        <div className="space-y-1">
          {MODES.map((mode) => {
            const isSelected = (!filters.mode && mode.value === 'ALL') || filters.mode === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => {
                  onChange({
                    ...filters,
                    mode: mode.value === 'ALL' ? undefined : mode.value,
                  });
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-trust-soft text-trust font-semibold'
                    : 'text-ink-soft hover:bg-canvas-alt hover:text-ink'
                }`}
              >
                <span>{mode.label}</span>
                {isSelected && <Check className="size-3.5 text-trust" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Category</label>
          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => onChange({ ...filters, category: undefined })}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                !filters.category
                  ? 'bg-trust-soft text-trust font-semibold'
                  : 'text-ink-soft hover:bg-canvas-alt hover:text-ink'
              }`}
            >
              <span>All Categories</span>
              {!filters.category && <Check className="size-3.5 text-trust" />}
            </button>
            {categories.map((cat) => {
              const isSelected = filters.category === cat.slug || filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChange({ ...filters, category: cat.slug })}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-trust-soft text-trust font-semibold'
                      : 'text-ink-soft hover:bg-canvas-alt hover:text-ink'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <Check className="size-3.5 text-trust shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Price Range (₹)</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onChange({ ...filters, minPrice: val });
            }}
            className="h-9 text-xs"
          />
          <span className="text-xs text-ink-faint">to</span>
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              onChange({ ...filters, maxPrice: val });
            }}
            className="h-9 text-xs"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {PRICE_PRESETS.map((preset) => {
            const isPresetActive =
              filters.minPrice === preset.min && filters.maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  if (isPresetActive) {
                    onChange({ ...filters, minPrice: undefined, maxPrice: undefined });
                  } else {
                    onChange({ ...filters, minPrice: preset.min, maxPrice: preset.max });
                  }
                }}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors cursor-pointer border ${
                  isPresetActive
                    ? 'border-trust bg-trust-soft text-trust'
                    : 'border-border/80 bg-canvas text-ink-soft hover:bg-canvas-alt'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">Sort Results</label>
        <select
          value={filters.sort ?? 'relevance'}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as SearchFilters['sort'] })}
          className="w-full h-9 rounded-xl border border-border bg-canvas px-3 text-xs text-ink focus:border-hope focus:outline-none"
        >
          <option value="relevance">Most Relevant</option>
          <option value="newest">Newly Listed</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
