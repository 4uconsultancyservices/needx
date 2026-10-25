'use client';

import * as React from 'react';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataTableToolbar } from './data-table-toolbar';
import { DataTablePagination } from './data-table-pagination';
import { DataTableColumnHeader } from './data-table-column-header';
import type {
  ColumnDef,
  DataTableProps,
  SortDirection,
  SortState,
} from './types';

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  title,
  description,
  icon: HeaderIcon,
  searchPlaceholder = 'Search records...',
  searchFilterKey,
  searchValue: controlledSearch,
  onSearchChange: onControlledSearchChange,
  serverSideSearch = false,
  quickTabs,
  activeTab: controlledTab,
  onTabChange: onControlledTabChange,
  facetFilters,
  activeFilters: controlledFilters,
  onFilterChange: onControlledFilterChange,
  page: controlledPage = 1,
  pageSize: controlledPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems: controlledTotal,
  onPageChange: onControlledPageChange,
  onPageSizeChange: onControlledPageSizeChange,
  serverSidePagination = false,
  defaultSort = { column: '', direction: null },
  onSortChange: onControlledSortChange,
  serverSideSorting = false,
  selectable = false,
  selectedKeys: controlledSelectedKeys,
  onSelectionChange: onControlledSelectionChange,
  batchActions,
  primaryAction,
  headerSlot,
  emptyTitle = 'No records match your criteria',
  emptyDescription = 'Try adjusting your search terms or clearing active filters.',
  emptyAction,
  exportFilename = 'export',
  exportable = true,
  onRowClick,
  className,
}: DataTableProps<T>) {
  // --- Uncontrolled State Fallbacks ---
  const [internalSearch, setInternalSearch] = React.useState('');
  const [internalTab, setInternalTab] = React.useState(quickTabs?.[0]?.id || 'ALL');
  const [internalFilters, setInternalFilters] = React.useState<Record<string, string[]>>({});
  const [internalPage, setInternalPage] = React.useState(1);
  const [internalPageSize, setInternalPageSize] = React.useState(20);
  const [internalSort, setInternalSort] = React.useState<SortState>(defaultSort);
  const [internalSelectedKeys, setInternalSelectedKeys] = React.useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    columns.forEach((c) => {
      init[c.id] = c.defaultHidden !== true;
    });
    return init;
  });

  // Controlled vs Uncontrolled sync
  const search = controlledSearch !== undefined ? controlledSearch : internalSearch;
  const onSearchChange = onControlledSearchChange || setInternalSearch;

  const currentTab = controlledTab !== undefined ? controlledTab : internalTab;
  const onTabChange = onControlledTabChange || setInternalTab;

  const activeFilters = controlledFilters !== undefined ? controlledFilters : internalFilters;
  const onFilterChange = (filterId: string, values: string[]) => {
    if (onControlledFilterChange) {
      onControlledFilterChange(filterId, values);
    } else {
      setInternalFilters((prev) => ({ ...prev, [filterId]: values }));
      setInternalPage(1);
    }
  };

  const handleClearAllFilters = () => {
    onSearchChange('');
    if (onControlledFilterChange) {
      facetFilters?.forEach((f) => onControlledFilterChange(f.id, []));
    } else {
      setInternalFilters({});
    }
    if (quickTabs && quickTabs[0]) {
      onTabChange(quickTabs[0].id);
    }
    onPageChange(1);
  };

  const page = controlledPage !== undefined ? controlledPage : internalPage;
  const onPageChange = (newPage: number) => {
    if (onControlledPageChange) onControlledPageChange(newPage);
    else setInternalPage(newPage);
  };

  const pageSize = controlledPageSize !== undefined ? controlledPageSize : internalPageSize;
  const onPageSizeChange = (newSize: number) => {
    if (onControlledPageSizeChange) onControlledPageSizeChange(newSize);
    else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  const sortState = internalSort;
  const handleSortToggle = (colId: string) => {
    let nextDir: SortDirection = 'asc';
    if (sortState.column === colId) {
      if (sortState.direction === 'asc') nextDir = 'desc';
      else if (sortState.direction === 'desc') nextDir = null;
    }
    const nextState = { column: nextDir ? colId : '', direction: nextDir };
    setInternalSort(nextState);
    if (onControlledSortChange) onControlledSortChange(nextState);
  };

  const selectedKeys = controlledSelectedKeys !== undefined ? controlledSelectedKeys : internalSelectedKeys;
  const onSelectionChange = onControlledSelectionChange || setInternalSelectedKeys;

  // --- Filtering & Sorting (Client-side when not server-side) ---
  const rawData = React.useMemo(() => data || [], [data]);

  const filteredData = React.useMemo(() => {
    let list = [...rawData];

    // 1. Client-side Quick Tab filter
    if (currentTab && currentTab !== 'ALL' && quickTabs) {
      const activeTabObj = quickTabs.find((t) => t.id === currentTab);
      if (activeTabObj?.predicate) {
        list = list.filter(activeTabObj.predicate);
      }
    }

    // 2. Client-side Search
    if (!serverSideSearch && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((item) => {
        if (typeof searchFilterKey === 'function') {
          return searchFilterKey(item, q);
        }
        if (typeof searchFilterKey === 'string' && typeof item === 'object' && item !== null && searchFilterKey in item) {
          return String((item as any)[searchFilterKey]).toLowerCase().includes(q);
        }
        // General search across all string values
        return item != null && typeof item === 'object'
          ? Object.values(item as Record<string, any>).some((val) =>
              String(val).toLowerCase().includes(q),
            )
          : false;
      });
    }

    // 3. Client-side Sorting
    if (!serverSideSorting && sortState.column && sortState.direction) {
      const colDef = columns.find((c) => c.id === sortState.column);
      list.sort((a, b) => {
        let valA = colDef?.accessorFn ? colDef.accessorFn(a) : colDef?.accessorKey ? (a as any)[colDef.accessorKey] : '';
        let valB = colDef?.accessorFn ? colDef.accessorFn(b) : colDef?.accessorKey ? (b as any)[colDef.accessorKey] : '';

        if (valA == null) valA = '';
        if (valB == null) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortState.direction === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortState.direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return list;
  }, [rawData, currentTab, quickTabs, search, serverSideSearch, searchFilterKey, serverSideSorting, sortState, columns]);

  // Paginated data slice
  const totalCount = controlledTotal !== undefined ? controlledTotal : filteredData.length;
  const paginatedData = React.useMemo(() => {
    if (serverSidePagination) return filteredData;
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, serverSidePagination, page, pageSize]);

  // Selection helpers
  const allCurrentKeys = React.useMemo(
    () => paginatedData.map(getRowKey),
    [paginatedData, getRowKey],
  );
  const isAllCurrentSelected =
    allCurrentKeys.length > 0 && allCurrentKeys.every((k) => selectedKeys.includes(k));
  const isSomeCurrentSelected =
    allCurrentKeys.some((k) => selectedKeys.includes(k)) && !isAllCurrentSelected;

  const handleSelectAllCurrent = (checked: boolean) => {
    if (checked) {
      const merged = Array.from(new Set([...selectedKeys, ...allCurrentKeys]));
      onSelectionChange(merged);
    } else {
      const filtered = selectedKeys.filter((k) => !allCurrentKeys.includes(k));
      onSelectionChange(filtered);
    }
  };

  const handleToggleRowSelect = (key: string) => {
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  const selectedItemObjects = React.useMemo(
    () => rawData.filter((item) => selectedKeys.includes(getRowKey(item))),
    [rawData, selectedKeys, getRowKey],
  );

  // Column Visibility toggle
  const handleToggleColumnVisibility = (colId: string) => {
    setVisibleColumns((prev) => ({ ...prev, [colId]: !prev[colId] }));
  };

  const visibleColumnDefs = React.useMemo(
    () => columns.filter((c) => visibleColumns[c.id] !== false),
    [columns, visibleColumns],
  );

  // CSV / JSON Export
  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = selectedItemObjects.length > 0 ? selectedItemObjects : filteredData;

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportFilename}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    // CSV format
    const headers = visibleColumnDefs.map((c) => (typeof c.header === 'string' ? c.header : c.id));
    const rows = dataToExport.map((item) => {
      return visibleColumnDefs.map((col) => {
        const val = col.accessorFn
          ? col.accessorFn(item)
          : col.accessorKey
          ? (item as any)[col.accessorKey]
          : '';
        const sanitized = String(val ?? '')
          .replace(/"/g, '""')
          .replace(/[\n\r]/g, ' ');
        return `"${sanitized}"`;
      });
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Optional Title Bar */}
      {(title || description) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-1">
          <div className="flex items-center gap-2.5">
            {HeaderIcon && (
              <div className="flex size-9 items-center justify-center rounded-xl bg-trust/10 text-trust shadow-2xs">
                <HeaderIcon className="size-5" />
              </div>
            )}
            <div>
              {title && <h2 className="text-lg font-bold text-ink tracking-tight">{title}</h2>}
              {description && <p className="text-xs text-ink-faint">{description}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Toolbar */}
      <DataTableToolbar
        searchQuery={search}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        quickTabs={quickTabs}
        activeTab={currentTab}
        onTabChange={onTabChange}
        facetFilters={facetFilters}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        onClearAllFilters={handleClearAllFilters}
        columns={columns}
        visibleColumns={visibleColumns}
        onToggleColumnVisibility={handleToggleColumnVisibility}
        selectedItems={selectedItemObjects}
        onClearSelection={() => onSelectionChange([])}
        batchActions={batchActions}
        exportable={exportable}
        onExport={handleExport}
        primaryAction={primaryAction}
        headerSlot={headerSlot}
        isLoading={isLoading}
      />

      {/* Master Data Table Container */}
      <div className="rounded-2xl border border-border/80 bg-surface shadow-xs overflow-hidden transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border/80 bg-canvas-alt/50">
                {/* Select All Checkbox Header */}
                {selectable && (
                  <th className="w-10 px-4 py-3.5">
                    <Checkbox
                      checked={isAllCurrentSelected ? true : isSomeCurrentSelected ? 'indeterminate' : false}
                      onCheckedChange={(checked) => handleSelectAllCurrent(Boolean(checked))}
                      aria-label="Select all rows"
                    />
                  </th>
                )}

                {/* Column Headers */}
                {visibleColumnDefs.map((col) => {
                  const isSorted =
                    sortState.column === col.id ? sortState.direction : null;

                  return (
                    <th
                      key={col.id}
                      className={cn(
                        'whitespace-nowrap px-4 py-3.5 sm:px-5 align-middle select-none',
                        col.hideOnMobile && 'hidden md:table-cell',
                        col.hideOnTablet && 'hidden lg:table-cell',
                        col.headerClassName,
                      )}
                    >
                      {typeof col.header === 'function' ? (
                        col.header({
                          column: col,
                          isSorted,
                          toggleSort: () => handleSortToggle(col.id),
                        })
                      ) : (
                        <DataTableColumnHeader
                          title={col.header}
                          sortable={col.sortable}
                          isSorted={isSorted}
                          onSortToggle={() => handleSortToggle(col.id)}
                          align={col.align}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                // Shimmer Loading Skeletons
                Array.from({ length: 6 }).map((_, rIdx) => (
                  <tr key={`loading-row-${rIdx}`} className="animate-pulse">
                    {selectable && (
                      <td className="px-4 py-4">
                        <Skeleton className="size-4 rounded-md" />
                      </td>
                    )}
                    {visibleColumnDefs.map((col, cIdx) => (
                      <td key={`loading-cell-${cIdx}`} className="px-4 py-4 sm:px-5">
                        <Skeleton className="h-4 w-3/4 rounded-sm" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginatedData.length === 0 ? (
                // Rich Empty State
                <tr>
                  <td
                    colSpan={visibleColumnDefs.length + (selectable ? 1 : 0)}
                    className="p-10 text-center"
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-trust/10 text-trust">
                        <Inbox className="size-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-ink">{emptyTitle}</h3>
                        <p className="text-xs text-ink-faint max-w-sm">{emptyDescription}</p>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        {emptyAction}
                        <button
                          type="button"
                          onClick={handleClearAllFilters}
                          className="text-xs font-semibold text-trust hover:underline"
                        >
                          Reset all filters
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                // Actual Data Rows
                paginatedData.map((item, rowIdx) => {
                  const key = getRowKey(item);
                  const isSelected = selectedKeys.includes(key);

                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(item)}
                      className={cn(
                        'transition-colors hover:bg-trust-soft/20 group',
                        isSelected && 'bg-trust-soft/30',
                        onRowClick && 'cursor-pointer',
                      )}
                    >
                      {/* Row Selection Checkbox */}
                      {selectable && (
                        <td
                          className="px-4 py-3.5 align-middle"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => handleToggleRowSelect(key)}
                            aria-label={`Select row ${rowIdx + 1}`}
                          />
                        </td>
                      )}

                      {/* Data Cells */}
                      {visibleColumnDefs.map((col) => {
                        const cellValue = col.accessorFn
                          ? col.accessorFn(item)
                          : col.accessorKey
                          ? (item as any)[col.accessorKey]
                          : undefined;

                        return (
                          <td
                            key={col.id}
                            className={cn(
                              'whitespace-nowrap px-4 py-3.5 sm:px-5 align-middle',
                              col.align === 'center' && 'text-center',
                              col.align === 'right' && 'text-right',
                              col.hideOnMobile && 'hidden md:table-cell',
                              col.hideOnTablet && 'hidden lg:table-cell',
                              col.className,
                            )}
                          >
                            {col.cell
                              ? col.cell({ item, value: cellValue, index: rowIdx, isSelected })
                              : cellValue != null
                              ? String(cellValue)
                              : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Bar */}
        {!isLoading && totalCount > 0 && (
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            totalItems={totalCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            selectedCount={selectedKeys.length}
          />
        )}
      </div>
    </div>
  );
}
