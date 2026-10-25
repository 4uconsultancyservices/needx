'use client';

import * as React from 'react';
import { DataTable } from '@/components/shared/data-table/data-table';
import type {
  BatchAction,
  ColumnDef,
  FacetFilter,
  QuickTab,
  SortState,
} from '@/components/shared/data-table/types';

export interface AdminColumn<T> {
  id?: string;
  header: string | React.ReactNode;
  render?: (item: T) => React.ReactNode;
  cell?: (props: { item: T; value: any; index: number; isSelected: boolean }) => React.ReactNode;
  accessorKey?: keyof T | string;
  accessorFn?: (item: T) => any;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

export interface AdminResourceTableProps<T> {
  items: T[] | undefined;
  columns: AdminColumn<T>[];
  getRowKey: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;

  // Rich dynamic features
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;

  searchPlaceholder?: string;
  searchFilterKey?: keyof T | string | ((item: T, query: string) => boolean);
  searchValue?: string;
  onSearchChange?: (q: string) => void;
  serverSideSearch?: boolean;

  quickTabs?: QuickTab<T>[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  facetFilters?: FacetFilter[];
  activeFilters?: Record<string, string[]>;
  onFilterChange?: (filterId: string, values: string[]) => void;

  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  serverSidePagination?: boolean;

  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;

  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  batchActions?: BatchAction<T>[];

  primaryAction?: React.ReactNode;
  headerSlot?: React.ReactNode;
  exportable?: boolean;
  exportFilename?: string;
  onRowClick?: (item: T) => void;
}

/** Shared CRM table shell used by /admin/* list pages with high-density
 * enterprise ergonomics, integrated dynamic filtering, pagination, selection, and export. */
export function AdminResourceTable<T>({
  items,
  columns,
  getRowKey,
  isLoading,
  emptyMessage = 'Nothing here yet.',
  className,
  title,
  description,
  icon,
  searchPlaceholder,
  searchFilterKey,
  searchValue,
  onSearchChange,
  serverSideSearch,
  quickTabs,
  activeTab,
  onTabChange,
  facetFilters,
  activeFilters,
  onFilterChange,
  page,
  pageSize,
  pageSizeOptions,
  totalItems,
  onPageChange,
  onPageSizeChange,
  serverSidePagination,
  defaultSort,
  onSortChange,
  selectable,
  selectedKeys,
  onSelectionChange,
  batchActions,
  primaryAction,
  headerSlot,
  exportable,
  exportFilename,
  onRowClick,
}: AdminResourceTableProps<T>) {
  // Map AdminColumn to ColumnDef
  const columnDefs: ColumnDef<T>[] = React.useMemo(() => {
    return columns.map((col, idx) => {
      const colId = col.id || (typeof col.header === 'string' ? col.header.toLowerCase().replace(/\s+/g, '_') : `col_${idx}`);

      return {
        id: colId,
        header: col.header,
        sortable: col.sortable,
        className: col.className,
        headerClassName: col.headerClassName,
        align: col.align,
        hideOnMobile: col.hideOnMobile,
        hideOnTablet: col.hideOnTablet,
        accessorKey: col.accessorKey,
        accessorFn: col.accessorFn,
        cell: (props) => {
          if (col.render) return col.render(props.item);
          if (col.cell) return col.cell(props);
          return props.value != null ? String(props.value) : '—';
        },
      };
    });
  }, [columns]);

  return (
    <DataTable<T>
      data={items}
      columns={columnDefs}
      getRowKey={getRowKey}
      isLoading={isLoading}
      emptyTitle={emptyMessage}
      className={className}
      title={title}
      description={description}
      icon={icon}
      searchPlaceholder={searchPlaceholder}
      searchFilterKey={searchFilterKey}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      serverSideSearch={serverSideSearch}
      quickTabs={quickTabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      facetFilters={facetFilters}
      activeFilters={activeFilters}
      onFilterChange={onFilterChange}
      page={page}
      pageSize={pageSize}
      pageSizeOptions={pageSizeOptions}
      totalItems={totalItems}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      serverSidePagination={serverSidePagination}
      defaultSort={defaultSort}
      onSortChange={onSortChange}
      selectable={selectable}
      selectedKeys={selectedKeys}
      onSelectionChange={onSelectionChange}
      batchActions={batchActions}
      primaryAction={primaryAction}
      headerSlot={headerSlot}
      exportable={exportable}
      exportFilename={exportFilename}
      onRowClick={onRowClick}
    />
  );
}
