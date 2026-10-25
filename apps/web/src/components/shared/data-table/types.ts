import type { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface ColumnDef<T> {
  id: string;
  header: ReactNode | ((props: { column: ColumnDef<T>; isSorted: SortDirection; toggleSort: () => void }) => ReactNode);
  accessorKey?: keyof T | string;
  accessorFn?: (item: T) => any;
  cell?: (props: { item: T; value: any; index: number; isSelected: boolean }) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  defaultHidden?: boolean;
}

export interface FilterOptionItem {
  label: string;
  value: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FacetFilter {
  id: string;
  title: string;
  options: FilterOptionItem[];
  multiple?: boolean;
}

export interface QuickTab<T = any> {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<{ className?: string }>;
  predicate?: (item: T) => boolean;
}

export interface BatchAction<T> {
  id?: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'accent' | 'hope' | 'faith' | 'subtle';
  onClick: (selectedItems: T[], clearSelection: () => void) => void | Promise<void>;
}

export type TableDensity = 'compact' | 'normal' | 'comfortable';

export interface DataTableProps<T> {
  data: T[] | undefined;
  columns: ColumnDef<T>[];
  getRowKey: (item: T) => string;
  isLoading?: boolean;

  // Title & Subtitle
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;

  // Search & Filters
  searchPlaceholder?: string;
  searchFilterKey?: keyof T | string | ((item: T, query: string) => boolean);
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  serverSideSearch?: boolean;

  quickTabs?: QuickTab<T>[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  facetFilters?: FacetFilter[];
  activeFilters?: Record<string, string[]>;
  onFilterChange?: (filterId: string, values: string[]) => void;

  // Pagination
  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  serverSidePagination?: boolean;

  // Sorting
  defaultSort?: SortState;
  onSortChange?: (sort: SortState) => void;
  serverSideSorting?: boolean;

  // Selection & Batch Actions
  selectable?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (selectedKeys: string[]) => void;
  batchActions?: BatchAction<T>[];

  // Actions & Custom Slots
  primaryAction?: ReactNode;
  headerSlot?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;

  // Export
  exportFilename?: string;
  exportable?: boolean;

  // Row interactions
  onRowClick?: (item: T) => void;
  className?: string;
}
