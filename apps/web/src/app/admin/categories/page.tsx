'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Boxes,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flame,
  FolderPlus,
  FolderTree,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Sliders,
  Sparkles,
  Tag,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  useCategoryAdminOverview,
  useBulkSetCategoryStatus,
  useUpdateCategory,
  useDeleteCategory,
  type CategoryAdminRecord,
} from '@/hooks/use-categories';
import { AdminResourceTable } from '@/components/admin/admin-resource-table';
import { CategoryExplorerModal } from '@/components/admin/category-explorer-modal';
import { CategoryFormModal } from '@/components/admin/category-form-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminCategoriesPage() {
  const { data: categories, isLoading, refetch, isFetching } = useCategoryAdminOverview();
  const bulkSetStatus = useBulkSetCategoryStatus();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  // Search & Filters State
  const [q, setQ] = useState('');
  const [tabFilter, setTabFilter] = useState<'ALL' | 'ROOT' | 'SUB' | 'UNDER_SUPPLIED' | 'BALANCED' | 'INACTIVE'>('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals state
  const [exploringCategory, setExploringCategory] = useState<CategoryAdminRecord | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryAdminRecord | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // KPI Calculations
  const totalCategories = categories?.length ?? 0;
  const rootCount = useMemo(() => (categories ?? []).filter((c) => !c.parentId).length, [categories]);
  const subCount = useMemo(() => (categories ?? []).filter((c) => Boolean(c.parentId)).length, [categories]);
  const activeCount = useMemo(() => (categories ?? []).filter((c) => c.isActive).length, [categories]);
  const underSuppliedCount = useMemo(
    () => (categories ?? []).filter((c) => c.marketHealth === 'UNDER_SUPPLIED').length,
    [categories],
  );
  const totalAttributesCount = useMemo(
    () => (categories ?? []).reduce((acc, c) => acc + (c.attributes?.length || 0), 0),
    [categories],
  );

  // Filtered List based on tab and search
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    let list = [...categories];

    // Filter by tab
    if (tabFilter === 'ROOT') list = list.filter((c) => !c.parentId);
    if (tabFilter === 'SUB') list = list.filter((c) => Boolean(c.parentId));
    if (tabFilter === 'UNDER_SUPPLIED') list = list.filter((c) => c.marketHealth === 'UNDER_SUPPLIED');
    if (tabFilter === 'BALANCED') list = list.filter((c) => c.marketHealth === 'BALANCED' || c.marketHealth === 'HIGH_DEMAND');
    if (tabFilter === 'INACTIVE') list = list.filter((c) => !c.isActive);

    // Filter by search query
    if (q.trim()) {
      const term = q.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term)) ||
          (c.keywords && c.keywords.some((k) => k.toLowerCase().includes(term))),
      );
    }

    return list;
  }, [categories, tabFilter, q]);

  // Actions
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryAdminRecord) => {
    setEditingCategory(cat);
    setIsFormModalOpen(true);
  };

  const handleToggleActive = async (id: string, activate: boolean) => {
    try {
      await updateCategory.mutateAsync({ id, data: { isActive: activate } });
      toast.success(activate ? 'Category activated' : 'Category deactivated');
      refetch();
    } catch {
      toast.error('Failed to change category status');
    }
  };

  const handleBulkSetStatus = async (ids: string[], activate: boolean) => {
    try {
      await bulkSetStatus.mutateAsync({ ids, isActive: activate });
      toast.success(`${activate ? 'Activated' : 'Deactivated'} ${ids.length} categories`);
      refetch();
    } catch {
      toast.error('Failed to update category statuses');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
              Categories &amp; Taxonomy Hub
            </h1>
            <Badge variant="trust" className="text-xs">
              Taxonomy &amp; Demand Engine
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Explore platform category depth, analyze demand-vs-inventory opportunity ratios, and manage custom attribute schemas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs"
          >
            <RefreshCw className={`mr-1.5 size-3.5 ${isFetching ? 'animate-spin text-trust' : ''}`} />
            Sync
          </Button>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-trust text-white hover:bg-trust-hover shadow-xs text-xs font-semibold"
          >
            <Plus className="mr-1.5 size-4" />
            + New Category
          </Button>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Total Taxonomy
            </span>
            <FolderTree className="size-4 text-trust" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{totalCategories}</p>
          <p className="mt-1 text-xs text-ink-soft">
            {rootCount} root tiers • {subCount} subcategories
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Active Marketplaces
            </span>
            <CheckCircle2 className="size-4 text-faith" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{activeCount}</p>
          <p className="mt-1 text-xs text-ink-soft">
            Live and accepting customer requests
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              High Opportunity Zones
            </span>
            <Flame className="size-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink text-amber-600 dark:text-amber-400">
            {underSuppliedCount}
          </p>
          <p className="mt-1 text-xs text-ink-soft">
            High customer demand with low supplier stock
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Custom Attributes
            </span>
            <Sliders className="size-4 text-trust" />
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-ink">{totalAttributesCount}</p>
          <p className="mt-1 text-xs text-ink-soft">
            Field schemas standardized across taxonomy
          </p>
        </div>
      </div>

      {/* Main Taxonomy & Demand DataTable */}
      <AdminResourceTable<CategoryAdminRecord>
        title="Taxonomy & Demand-Supply Registry"
        description="Hierarchical category breakdown with real-time demand volumes, supplier inventory coverage, and liquidity health."
        icon={FolderTree}
        items={filteredCategories}
        getRowKey={(c) => c.id}
        isLoading={isLoading}
        emptyMessage="No category records match your filter criteria."
        searchValue={q}
        onSearchChange={(nextQ) => {
          setQ(nextQ);
          setPage(1);
        }}
        searchPlaceholder="Search categories by name, slug, keywords, or description..."
        serverSideSearch={false}
        quickTabs={[
          { id: 'ALL', label: 'All Categories', count: totalCategories },
          { id: 'ROOT', label: 'Root Tiers', count: rootCount },
          { id: 'SUB', label: 'Subcategories', count: subCount },
          { id: 'UNDER_SUPPLIED', label: 'High Opportunity (Under-Supplied)', count: underSuppliedCount },
          { id: 'BALANCED', label: 'Balanced / Healthy', count: (categories ?? []).filter((c) => c.marketHealth === 'BALANCED' || c.marketHealth === 'HIGH_DEMAND').length },
          { id: 'INACTIVE', label: 'Inactive / Drafts', count: totalCategories - activeCount },
        ]}
        activeTab={tabFilter}
        onTabChange={(tabId) => {
          setTabFilter(tabId as typeof tabFilter);
          setPage(1);
        }}
        facetFilters={[
          {
            id: 'health',
            title: 'Market Health',
            options: [
              { label: 'Under-Supplied (Opportunity)', value: 'UNDER_SUPPLIED' },
              { label: 'High Demand', value: 'HIGH_DEMAND' },
              { label: 'Balanced', value: 'BALANCED' },
              { label: 'Over-Supplied', value: 'OVER_SUPPLIED' },
              { label: 'Untested (0 Demands)', value: 'UNTESTED' },
            ],
          },
          {
            id: 'status',
            title: 'Marketplace Status',
            options: [
              { label: 'Active', value: 'active', count: activeCount },
              { label: 'Inactive', value: 'inactive', count: totalCategories - activeCount },
            ],
          },
        ]}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        totalItems={filteredCategories.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        serverSidePagination={false}
        selectable={true}
        exportable={true}
        exportFilename="needx_taxonomy_categories"
        onRowClick={(item) => setExploringCategory(item)}
        batchActions={[
          {
            id: 'export-csv',
            label: 'Export CSV',
            icon: ExternalLink,
            onClick: (selected) => {
              const rows = [
                ['ID', 'Name', 'Slug', 'Parent', 'Demands', 'Inventory', 'Providers', 'Health', 'Active'].join(','),
                ...selected.map((c) => [
                  c.id,
                  `"${c.name.replace(/"/g, '""')}"`,
                  c.slug,
                  c.parentCategory?.name ? `"${c.parentCategory.name.replace(/"/g, '""')}"` : 'ROOT',
                  c.demandsCount,
                  c.inventoryCount,
                  c.providerCount,
                  c.marketHealth,
                  c.isActive ? 'ACTIVE' : 'INACTIVE',
                ].join(',')),
              ].join('\n');
              const blob = new Blob([rows], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `taxonomy_categories_${Date.now()}.csv`;
              link.click();
              URL.revokeObjectURL(url);
              toast.success(`Exported ${selected.length} categories to CSV`);
            },
          },
          {
            id: 'copy-slugs',
            label: 'Copy Category Slugs',
            icon: Copy,
            onClick: (selected) => {
              const slugs = selected.map((c) => c.slug).join('\n');
              navigator.clipboard.writeText(slugs);
              toast.success(`Copied ${selected.length} slugs`);
            },
          },
          {
            id: 'bulk-activate',
            label: 'Activate Selected',
            icon: CheckCircle2,
            onClick: (selected) => handleBulkSetStatus(selected.map((c) => c.id), true),
          },
          {
            id: 'bulk-deactivate',
            label: 'Deactivate Selected',
            icon: XCircle,
            variant: 'destructive',
            onClick: (selected) => handleBulkSetStatus(selected.map((c) => c.id), false),
          },
        ]}
        columns={[
          {
            id: 'name',
            header: 'Category & Slug',
            sortable: true,
            accessorFn: (c) => c.name,
            render: (c) => (
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-trust/10 border border-trust/20 text-trust shadow-xs">
                  <FolderTree className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-ink text-xs truncate">{c.name}</span>
                    {c.parentCategory && (
                      <span className="rounded bg-canvas-alt px-1.5 py-0.2 text-[9px] font-semibold text-ink-soft border border-border">
                        Sub
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[11px] text-ink-faint truncate">/{c.slug}</p>
                </div>
              </div>
            ),
          },
          {
            id: 'hierarchy',
            header: 'Hierarchy Level',
            sortable: true,
            accessorFn: (c) => c.parentCategory?.name || 'ROOT',
            render: (c) => (
              <div className="text-xs space-y-0.5">
                {c.parentCategory ? (
                  <div>
                    <span className="text-[10px] text-ink-faint block">Child of:</span>
                    <span className="font-semibold text-trust text-xs">{c.parentCategory.name}</span>
                  </div>
                ) : (
                  <div>
                    <span className="inline-flex items-center rounded-md bg-canvas-alt px-2 py-0.5 text-[10px] font-bold text-ink-soft border border-border">
                      ROOT TIER
                    </span>
                    {c.subcategoriesCount > 0 && (
                      <span className="ml-1.5 text-[10px] text-ink-faint">
                        ({c.subcategoriesCount} sub)
                      </span>
                    )}
                  </div>
                )}
              </div>
            ),
          },
          {
            id: 'demands',
            header: 'Customer Demands',
            sortable: true,
            accessorFn: (c) => c.demandsCount,
            render: (c) => (
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-ink">{c.demandsCount}</span>
                  <span className="text-ink-faint text-[11px]">needs</span>
                </div>
                {c.activeDemandsCount > 0 ? (
                  <span className="inline-block text-[10px] font-semibold text-trust">
                    ● {c.activeDemandsCount} active request(s)
                  </span>
                ) : (
                  <span className="text-[10px] text-ink-faint">No open needs</span>
                )}
              </div>
            ),
          },
          {
            id: 'inventory',
            header: 'Provider Inventory',
            sortable: true,
            accessorFn: (c) => c.inventoryCount,
            render: (c) => (
              <div className="space-y-0.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-ink">{c.inventoryCount}</span>
                  <span className="text-ink-faint text-[11px]">listings</span>
                </div>
                <p className="text-[10px] text-ink-faint">
                  {c.providerCount} provider(s)
                </p>
              </div>
            ),
          },
          {
            id: 'health',
            header: 'Market Opportunity',
            sortable: true,
            accessorFn: (c) => c.marketHealth,
            render: (c) => {
              if (c.marketHealth === 'UNDER_SUPPLIED') {
                return (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    <Flame className="size-3 fill-amber-500" />
                    High Opportunity
                  </span>
                );
              }
              if (c.marketHealth === 'HIGH_DEMAND') {
                return (
                  <span className="inline-flex items-center gap-1 rounded-full border border-trust/30 bg-trust/10 px-2 py-0.5 text-[10px] font-bold text-trust">
                    <TrendingUp className="size-3" />
                    High Velocity
                  </span>
                );
              }
              if (c.marketHealth === 'OVER_SUPPLIED') {
                return (
                  <span className="inline-flex items-center gap-1 rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                    Surplus Stock
                  </span>
                );
              }
              if (c.marketHealth === 'BALANCED') {
                return (
                  <span className="inline-flex items-center gap-1 rounded-full border border-faith/30 bg-faith/10 px-2 py-0.5 text-[10px] font-semibold text-faith">
                    Balanced
                  </span>
                );
              }
              return (
                <span className="inline-flex items-center rounded-full border border-border bg-canvas-alt px-2 py-0.5 text-[10px] text-ink-faint font-medium">
                  Untested
                </span>
              );
            },
          },
          {
            id: 'schema',
            header: 'AI & Attributes',
            render: (c) => (
              <div className="flex flex-wrap items-center gap-1 max-w-[150px]">
                <Badge variant="outline" className="text-[9px] font-mono">
                  {(c.keywords || []).length} keywords
                </Badge>
                {(c.attributes || []).length > 0 && (
                  <Badge variant="outline" className="text-[9px] text-trust border-trust/30 bg-trust/5">
                    {c.attributes.length} attrs
                  </Badge>
                )}
              </div>
            ),
          },
          {
            id: 'status',
            header: 'Status',
            sortable: true,
            accessorFn: (c) => (c.isActive ? 'Active' : 'Inactive'),
            render: (c) => (
              <Badge variant={c.isActive ? 'faith' : 'default'} className="text-[10px]">
                {c.isActive ? 'Active' : 'Draft / Inactive'}
              </Badge>
            ),
          },
          {
            id: 'actions',
            header: 'Actions',
            align: 'right',
            render: (c) => (
              <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExploringCategory(c)}
                  className="h-7 text-xs px-2 font-semibold text-trust hover:bg-trust/10 border-trust/30"
                  title="Explore Demands and Inventory"
                >
                  <Search className="size-3 mr-1" /> Explore 360
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOpenEdit(c)}
                  className="h-7 text-xs px-2 text-ink-soft hover:text-ink"
                  title="Edit Category"
                >
                  <Sliders className="size-3" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* SEPARATE MODAL 1: 360 Category Explorer (Demands, Inventory, and Ratios) */}
      <CategoryExplorerModal
        category={exploringCategory}
        isOpen={Boolean(exploringCategory)}
        onClose={() => setExploringCategory(null)}
        onEdit={(cat) => {
          setExploringCategory(null);
          handleOpenEdit(cat);
        }}
        onToggleActive={async (id, activate) => {
          await handleToggleActive(id, activate);
          if (exploringCategory) {
            setExploringCategory({ ...exploringCategory, isActive: activate });
          }
        }}
      />

      {/* SEPARATE MODAL 2: Create / Edit Category Modal */}
      <CategoryFormModal
        category={editingCategory}
        allCategories={categories || []}
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
