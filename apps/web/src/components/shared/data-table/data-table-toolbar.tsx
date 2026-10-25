'use client';

import * as React from 'react';
import {
  Download,
  Filter,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
  Check,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { BatchAction, ColumnDef, FacetFilter, QuickTab } from './types';

interface DataTableToolbarProps<T> {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;

  quickTabs?: QuickTab<T>[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  facetFilters?: FacetFilter[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (filterId: string, values: string[]) => void;
  onClearAllFilters: () => void;

  columns: ColumnDef<T>[];
  visibleColumns: Record<string, boolean>;
  onToggleColumnVisibility: (colId: string) => void;

  selectedItems: T[];
  onClearSelection: () => void;
  batchActions?: BatchAction<T>[];

  exportable?: boolean;
  onExport?: (format: 'csv' | 'json') => void;

  primaryAction?: React.ReactNode;
  headerSlot?: React.ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function DataTableToolbar<T>({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  quickTabs,
  activeTab,
  onTabChange,
  facetFilters,
  activeFilters,
  onFilterChange,
  onClearAllFilters,
  columns,
  visibleColumns,
  onToggleColumnVisibility,
  selectedItems,
  onClearSelection,
  batchActions,
  exportable = true,
  onExport,
  primaryAction,
  headerSlot,
  isLoading,
  onRefresh,
  className,
}: DataTableToolbarProps<T>) {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    Object.values(activeFilters).some((vals) => vals && vals.length > 0) ||
    (activeTab && activeTab !== 'ALL');

  const activeFilterCount =
    Object.values(activeFilters).reduce((acc, curr) => acc + (curr?.length || 0), 0) +
    (searchQuery ? 1 : 0);

  return (
    <div className={cn('space-y-3.5', className)}>
      {/* Top Header Row (if Quick Tabs or Actions provided) */}
      {(quickTabs && quickTabs.length > 0) || primaryAction || headerSlot ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Quick Tabs */}
          {quickTabs && quickTabs.length > 0 ? (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {quickTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange?.(tab.id)}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-trust text-white shadow-xs'
                        : 'bg-surface text-ink-soft hover:bg-canvas-alt hover:text-ink border border-border/70',
                    )}
                  >
                    {Icon && <Icon className="size-3.5" />}
                    <span>{tab.label}</span>
                    {typeof tab.count === 'number' && (
                      <span
                        className={cn(
                          'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold leading-none',
                          isActive ? 'bg-white/20 text-white' : 'bg-canvas-alt text-ink-faint',
                        )}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div />
          )}

          {/* Primary Action / Slot */}
          <div className="flex items-center gap-2 shrink-0">
            {headerSlot}
            {primaryAction}
          </div>
        </div>
      ) : null}

      {/* Main Filter & Action Controls Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-faint pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-9 pl-9 pr-8 text-xs bg-surface"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
                title="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Facet Filter Dropdowns */}
          {facetFilters &&
            facetFilters.map((filter) => {
              const currentVals = activeFilters[filter.id] || [];
              const isFiltered = currentVals.length > 0;

              return (
                <DropdownMenu key={filter.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'h-9 gap-1.5 text-xs font-medium border-border/80 bg-surface',
                        isFiltered && 'border-trust bg-trust/5 text-trust font-semibold',
                      )}
                    >
                      <Filter className="size-3" />
                      <span>{filter.title}</span>
                      {isFiltered && (
                        <span className="flex size-4 items-center justify-center rounded-full bg-trust text-[10px] font-bold text-white">
                          {currentVals.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-52 p-1">
                    <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-ink-faint px-2 py-1.5">
                      {filter.title}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {filter.options.map((opt) => {
                      const isChecked = currentVals.includes(opt.value);
                      const Icon = opt.icon;

                      return (
                        <DropdownMenuCheckboxItem
                          key={opt.value}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            if (filter.multiple === false) {
                              onFilterChange(filter.id, checked ? [opt.value] : []);
                            } else {
                              const next = checked
                                ? [...currentVals, opt.value]
                                : currentVals.filter((v) => v !== opt.value);
                              onFilterChange(filter.id, next);
                            }
                          }}
                          className="text-xs"
                        >
                          <div className="flex flex-1 items-center justify-between gap-2">
                            <span className="flex items-center gap-1.5">
                              {Icon && <Icon className="size-3.5 text-ink-faint" />}
                              <span>{opt.label}</span>
                            </span>
                            {typeof opt.count === 'number' && (
                              <span className="text-[10px] text-ink-faint font-mono">
                                {opt.count}
                              </span>
                            )}
                          </div>
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                    {isFiltered && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onFilterChange(filter.id, [])}
                          className="justify-center text-xs font-semibold text-danger focus:text-danger cursor-pointer"
                        >
                          Clear {filter.title} filter
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}

          {/* Clear All Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAllFilters}
              className="h-9 gap-1 text-xs text-ink-faint hover:text-danger hover:bg-danger/5"
            >
              <X className="size-3" />
              Reset
            </Button>
          )}
        </div>

        {/* Right side utilities: View options, Export, Refresh */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {/* Column Visibility Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs text-ink-soft bg-surface"
                title="Toggle Columns"
              >
                <SlidersHorizontal className="size-3.5" />
                <span className="hidden md:inline">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 p-1">
              <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-ink-faint px-2 py-1">
                Toggle Columns
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map((col) => {
                const headerText =
                  typeof col.header === 'string'
                    ? col.header
                    : col.id.replace(/([A-Z])/g, ' $1');
                const isChecked = visibleColumns[col.id] !== false;

                return (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    checked={isChecked}
                    onCheckedChange={() => onToggleColumnVisibility(col.id)}
                    className="text-xs capitalize"
                  >
                    {headerText}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Export Dropdown */}
          {exportable && onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 text-xs text-ink-soft bg-surface"
                  title="Export Data"
                >
                  <Download className="size-3.5" />
                  <span className="hidden md:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 p-1">
                <DropdownMenuItem onClick={() => onExport('csv')} className="text-xs cursor-pointer">
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')} className="text-xs cursor-pointer">
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Refresh button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-9 size-9 p-0 text-ink-soft bg-surface"
              title="Refresh Records"
            >
              <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin text-trust')} />
            </Button>
          )}
        </div>
      </div>

      {/* Floating Batch Actions Bar when rows are selected */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-trust/40 bg-trust-soft/60 px-4 py-2.5 text-xs shadow-xs animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <span className="flex size-5 items-center justify-center rounded-full bg-trust text-white text-[10px] font-bold">
              {selectedItems.length}
            </span>
            <span className="font-semibold text-trust">
              {selectedItems.length} row{selectedItems.length === 1 ? '' : 's'} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 px-2 text-[11px] text-ink-soft hover:text-ink"
            >
              Deselect All
            </Button>
          </div>

          {/* Custom Batch Action Buttons */}
          <div className="flex items-center gap-2">
            {batchActions &&
              batchActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={idx}
                    variant={action.variant || 'default'}
                    size="sm"
                    className="h-7 text-xs font-semibold gap-1.5"
                    onClick={() => action.onClick(selectedItems, onClearSelection)}
                  >
                    {Icon && <Icon className="size-3" />}
                    <span>{action.label}</span>
                  </Button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
