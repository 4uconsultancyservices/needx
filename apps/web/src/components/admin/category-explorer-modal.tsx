'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  Boxes,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Flame,
  FolderTree,
  Hash,
  HelpCircle,
  Layers,
  ListFilter,
  Loader2,
  MapPin,
  Package,
  Plus,
  Scale,
  Search,
  Sliders,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import {
  useCategoryExplorer,
  type CategoryAdminRecord,
} from '@/hooks/use-categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

interface CategoryExplorerModalProps {
  category: CategoryAdminRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (cat: CategoryAdminRecord) => void;
  onToggleActive: (id: string, activate: boolean) => void;
}

export function CategoryExplorerModal({
  category,
  isOpen,
  onClose,
  onEdit,
  onToggleActive,
}: CategoryExplorerModalProps) {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'NEEDS' | 'LISTINGS' | 'SCHEMA'>('METRICS');
  const { data: explorer, isLoading } = useCategoryExplorer(category?.id);

  if (!category) return null;

  const stats = explorer?.stats || {
    totalNeeds: category.demandsCount,
    activeNeeds: category.activeDemandsCount,
    totalListings: category.inventoryCount,
    activeListings: category.activeInventoryCount,
    providerCount: category.providerCount,
    marketHealth: category.marketHealth,
  };

  const isUnderSupplied = stats.marketHealth === 'UNDER_SUPPLIED';
  const isHighDemand = stats.marketHealth === 'HIGH_DEMAND';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0 border-border bg-surface text-ink shadow-2xl">
        {/* Header with Category Identity & Actions */}
        <div className="border-b border-border bg-gradient-to-r from-canvas-alt via-surface to-canvas-alt p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-trust/10 border border-trust/20 text-trust shadow-xs">
                <FolderTree className="size-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                    {category.name}
                  </h2>
                  <Badge variant={category.isActive ? 'faith' : 'default'} className="text-[10px]">
                    {category.isActive ? 'Active Marketplace' : 'Inactive / Draft'}
                  </Badge>
                  {isUnderSupplied && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-500">
                      <Flame className="size-3.5 fill-amber-500" /> High Opportunity (Under-Supplied)
                    </span>
                  )}
                  {isHighDemand && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-trust/30 bg-trust/10 px-2.5 py-0.5 text-xs font-bold text-trust">
                      <TrendingUp className="size-3.5" /> High Velocity Demand
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-3 text-xs text-ink-soft flex-wrap">
                  <span className="font-mono text-ink-faint">slug: /{category.slug}</span>
                  {category.parentCategory ? (
                    <span className="flex items-center gap-1 text-trust font-medium">
                      <span>Subcategory of</span>
                      <span className="font-semibold underline">{category.parentCategory.name}</span>
                    </span>
                  ) : (
                    <span className="text-ink-faint">Root Category</span>
                  )}
                  <span>•</span>
                  <span>Sort Order: #{category.sortOrder}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(category)}
                className="text-xs font-semibold"
              >
                <Sliders className="mr-1.5 size-3.5 text-trust" /> Edit Taxonomy
              </Button>
              <Button
                variant={category.isActive ? 'outline' : 'default'}
                size="sm"
                onClick={() => onToggleActive(category.id, !category.isActive)}
                className="text-xs font-semibold"
              >
                {category.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>

          {category.description && (
            <p className="mt-3 text-xs text-ink-soft bg-surface/60 rounded-lg p-2.5 border border-border/60">
              {category.description}
            </p>
          )}

          {/* Navigation Tabs */}
          <div className="mt-6 flex items-center gap-2 border-b border-border/60 -mb-6">
            {[
              { id: 'METRICS', label: 'Market Ratios & Supply', icon: Scale },
              {
                id: 'NEEDS',
                label: `Demands (${stats.totalNeeds})`,
                icon: Layers,
                count: stats.activeNeeds > 0 ? `${stats.activeNeeds} active` : undefined,
              },
              {
                id: 'LISTINGS',
                label: `Inventory (${stats.totalListings})`,
                icon: Package,
                count: stats.activeListings > 0 ? `${stats.activeListings} active` : undefined,
              },
              {
                id: 'SCHEMA',
                label: `Attributes & AI (${(category.attributes || []).length})`,
                icon: Sparkles,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'border-trust text-trust bg-trust/5 rounded-t-lg'
                      : 'border-transparent text-ink-soft hover:text-ink hover:border-border'
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span className="rounded-full bg-trust/15 px-1.5 py-0.2 text-[10px] font-bold text-trust">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Body with Tab Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-ink-soft">
              <Loader2 className="size-8 animate-spin text-trust" />
              <p className="mt-3 text-xs font-medium">Aggregating market demand and inventory stats...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: Market Intelligence & Ratios */}
              {activeTab === 'METRICS' && (
                <div className="space-y-6">
                  {/* Top Ratio Highlight Card */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-canvas-alt/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                          Total Customer Demands
                        </span>
                        <Layers className="size-4 text-trust" />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-ink">{stats.totalNeeds}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        <span className="font-semibold text-trust">{stats.activeNeeds} active</span> looking for offers
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-canvas-alt/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                          Provider Inventory
                        </span>
                        <Package className="size-4 text-hope" />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-ink">{stats.totalListings}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        <span className="font-semibold text-hope">{stats.activeListings} available</span> listings
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-canvas-alt/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                          Verified Providers
                        </span>
                        <Users className="size-4 text-faith" />
                      </div>
                      <p className="mt-2 text-2xl font-bold text-ink">{stats.providerCount}</p>
                      <p className="mt-1 text-xs text-ink-soft">Registered supply partners</p>
                    </div>

                    <div className="rounded-xl border border-border bg-canvas-alt/50 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                          Market Health
                        </span>
                        <Scale className="size-4 text-ink" />
                      </div>
                      <p className="mt-2 text-sm font-bold text-ink">
                        {stats.marketHealth.replace('_', ' ')}
                      </p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {isUnderSupplied
                          ? 'Needs supplier onboarding'
                          : stats.totalNeeds > 0
                            ? 'Actively matching'
                            : 'Awaiting demand'}
                      </p>
                    </div>
                  </div>

                  {/* Supply vs Demand Comparison Gauge */}
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                      <Scale className="size-4 text-trust" />
                      Demand vs. Inventory Balance Ratio
                    </h3>
                    <p className="mt-1 text-xs text-ink-soft">
                      Real-time liquidity monitor evaluating whether customer requests can be satisfied by current stock.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1">
                          <span className="text-trust font-semibold">
                            Customer Demands ({stats.totalNeeds})
                          </span>
                          <span className="text-hope font-semibold">
                            Provider Listings ({stats.totalListings})
                          </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-canvas-alt overflow-hidden flex border border-border">
                          <div
                            className="h-full bg-trust transition-all duration-500"
                            style={{
                              width: `${
                                stats.totalNeeds + stats.totalListings > 0
                                  ? (stats.totalNeeds / (stats.totalNeeds + stats.totalListings)) * 100
                                  : 50
                              }%`,
                            }}
                          />
                          <div
                            className="h-full bg-hope transition-all duration-500"
                            style={{
                              width: `${
                                stats.totalNeeds + stats.totalListings > 0
                                  ? (stats.totalListings / (stats.totalNeeds + stats.totalListings)) * 100
                                  : 50
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      {isUnderSupplied && (
                        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                          <AlertCircle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold">Opportunity Alert: High Demand with Low Inventory</p>
                            <p className="mt-0.5 text-xs opacity-90">
                              Customers are actively requesting items/services in this category, but provider listings are limited. Target providers in this segment for platform onboarding.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subcategories (if any) */}
                  {explorer?.subcategories && explorer.subcategories.length > 0 && (
                    <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
                      <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                        <FolderTree className="size-4 text-trust" />
                        Subcategory Hierarchy ({explorer.subcategories.length})
                      </h3>
                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                        {explorer.subcategories.map((sub) => (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between rounded-lg border border-border bg-canvas-alt p-3"
                          >
                            <div>
                              <p className="text-xs font-bold text-ink">{sub.name}</p>
                              <p className="font-mono text-[10px] text-ink-faint">/{sub.slug}</p>
                            </div>
                            <Badge variant={sub.isActive ? 'faith' : 'default'} className="text-[9px]">
                              {sub.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deep Link References */}
                  <div className="flex items-center justify-between rounded-xl border border-border bg-gradient-to-r from-trust/5 via-canvas-alt to-trust/5 p-4">
                    <div>
                      <h4 className="text-xs font-bold text-ink">Explore in Dedicated Resource Modules</h4>
                      <p className="text-[11px] text-ink-soft">
                        Inspect matched needs, incoming quotes, or provider stock for {category.name}.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/needs`} className="inline-flex">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Layers className="size-3.5 mr-1 text-trust" /> View All Demands
                        </Button>
                      </Link>
                      <Link href={`/admin/listings`} className="inline-flex">
                        <Button size="sm" variant="outline" className="text-xs">
                          <Package className="size-3.5 mr-1 text-hope" /> View Listings
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Live Demands (Customer Needs) */}
              {activeTab === 'NEEDS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink">Recent Customer Demands</h3>
                      <p className="text-xs text-ink-soft">
                        Live and past requests posted by customers categorized under {category.name}.
                      </p>
                    </div>
                    <Link href={`/admin/needs`} className="inline-flex">
                      <Button size="sm" variant="outline" className="text-xs">
                        Open Needs Manager <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {explorer?.recentNeeds && explorer.recentNeeds.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-surface">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-border bg-canvas-alt text-[11px] font-semibold text-ink-faint uppercase">
                          <tr>
                            <th className="p-3">Need Request</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Location</th>
                            <th className="p-3">Budget</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Posted</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {explorer.recentNeeds.map((need) => (
                            <tr key={need.id} className="hover:bg-canvas-alt/50 transition-colors">
                              <td className="p-3 font-semibold text-ink max-w-[220px] truncate">
                                {need.title}
                              </td>
                              <td className="p-3 text-ink-soft">
                                {need.user?.name || 'Customer'}
                              </td>
                              <td className="p-3 text-ink-faint">
                                {need.location?.city || need.user?.city || '—'}
                              </td>
                              <td className="p-3 font-mono font-medium text-ink">
                                {need.budget?.max ? `₹${need.budget.max.toLocaleString('en-IN')}` : 'Open'}
                              </td>
                              <td className="p-3">
                                <Badge
                                  variant={need.status === 'MATCHED' ? 'faith' : need.status === 'PENDING' ? 'trust' : 'default'}
                                  className="text-[10px]"
                                >
                                  {need.status}
                                </Badge>
                              </td>
                              <td className="p-3 text-ink-faint font-mono text-[11px]">
                                {need.createdAt ? formatDate(need.createdAt) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border py-12 text-center text-ink-soft">
                      <Layers className="size-8 mx-auto text-ink-faint mb-2" />
                      <p className="text-xs font-medium">No customer needs posted in this category yet.</p>
                      <p className="text-[11px] text-ink-faint">
                        When buyers submit requests matching this category, they will appear here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Inventory & Listings */}
              {activeTab === 'LISTINGS' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-ink">Provider Inventory &amp; Listings</h3>
                      <p className="text-xs text-ink-soft">
                        Supplies, equipment, and services offered by registered providers in {category.name}.
                      </p>
                    </div>
                    <Link href={`/admin/listings`} className="inline-flex">
                      <Button size="sm" variant="outline" className="text-xs">
                        Open Catalog Manager <ArrowRight className="size-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  {explorer?.recentListings && explorer.recentListings.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-surface">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-border bg-canvas-alt text-[11px] font-semibold text-ink-faint uppercase">
                          <tr>
                            <th className="p-3">Listing Title</th>
                            <th className="p-3">Provider / Business</th>
                            <th className="p-3">Pricing</th>
                            <th className="p-3">Rating</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Created</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {explorer.recentListings.map((item) => (
                            <tr key={item.id} className="hover:bg-canvas-alt/50 transition-colors">
                              <td className="p-3 font-semibold text-ink max-w-[220px] truncate">
                                {item.title}
                              </td>
                              <td className="p-3">
                                <p className="font-medium text-ink">
                                  {item.provider?.businessName || item.provider?.name || 'Provider'}
                                </p>
                                <p className="text-[10px] text-ink-faint">{item.provider?.city || 'India'}</p>
                              </td>
                              <td className="p-3 font-mono font-medium text-ink">
                                ₹{item.basePrice?.toLocaleString('en-IN')}/{item.pricingMode?.toLowerCase() || 'day'}
                              </td>
                              <td className="p-3 text-amber-500 font-semibold flex items-center gap-1">
                                <Star className="size-3 fill-amber-400 text-amber-400" />
                                {item.ratingAverage ? item.ratingAverage.toFixed(1) : '5.0'}
                              </td>
                              <td className="p-3">
                                <Badge variant={item.status === 'ACTIVE' ? 'faith' : 'default'} className="text-[10px]">
                                  {item.status}
                                </Badge>
                              </td>
                              <td className="p-3 text-ink-faint font-mono text-[11px]">
                                {item.createdAt ? formatDate(item.createdAt) : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border py-12 text-center text-ink-soft">
                      <Package className="size-8 mx-auto text-ink-faint mb-2" />
                      <p className="text-xs font-medium">No provider listings published in this category yet.</p>
                      <p className="text-[11px] text-ink-faint">
                        Onboard new suppliers to start building inventory coverage.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Attribute Schema & AI Keywords */}
              {activeTab === 'SCHEMA' && (
                <div className="space-y-6">
                  {/* AI Inference Keywords */}
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                          <Sparkles className="size-4 text-trust" />
                          AI Need-Parser Training Keywords ({(category.keywords || []).length})
                        </h3>
                        <p className="text-xs text-ink-soft mt-0.5">
                          When a customer posts natural text, NEEDX AI matches these keywords to automatically infer {category.name}.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(category)}
                        className="text-xs"
                      >
                        Edit Keywords
                      </Button>
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {(category.keywords || []).length > 0 ? (
                        category.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded-lg border border-trust/20 bg-trust/5 px-2.5 py-1 text-xs font-mono text-trust"
                          >
                            <Tag className="size-3 opacity-60" />
                            {kw}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-ink-faint italic">
                          No inference keywords configured. Click Edit Taxonomy to add keywords.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Attribute Specifications */}
                  <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                          <Sliders className="size-4 text-trust" />
                          Dynamic Category Attributes ({(category.attributes || []).length})
                        </h3>
                        <p className="text-xs text-ink-soft mt-0.5">
                          Custom specification fields required or requested when posting needs and listings in this category.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(category)}
                        className="text-xs"
                      >
                        Manage Attributes
                      </Button>
                    </div>

                    {(category.attributes || []).length > 0 ? (
                      <div className="mt-4 overflow-hidden rounded-lg border border-border">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-canvas-alt text-[11px] font-semibold text-ink-faint uppercase border-b border-border">
                            <tr>
                              <th className="p-3">Field Label</th>
                              <th className="p-3">Field Key</th>
                              <th className="p-3">Data Type</th>
                              <th className="p-3">Requirement</th>
                              <th className="p-3">Unit / Options</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {category.attributes.map((attr, idx) => (
                              <tr key={idx} className="hover:bg-canvas-alt/50">
                                <td className="p-3 font-semibold text-ink">{attr.label}</td>
                                <td className="p-3 font-mono text-[11px] text-ink-soft">{attr.key}</td>
                                <td className="p-3">
                                  <Badge variant="outline" className="font-mono text-[10px]">
                                    {attr.type}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  {attr.required ? (
                                    <span className="text-danger font-semibold text-[11px]">Required</span>
                                  ) : (
                                    <span className="text-ink-faint text-[11px]">Optional</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  {attr.unit && (
                                    <span className="font-mono text-xs text-ink-soft mr-2">
                                      Unit: {attr.unit}
                                    </span>
                                  )}
                                  {attr.options && attr.options.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                      {attr.options.map((opt, oIdx) => (
                                        <span
                                          key={oIdx}
                                          className="rounded bg-canvas-alt px-1.5 py-0.2 text-[10px] text-ink-soft border border-border"
                                        >
                                          {opt}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-lg border border-dashed border-border py-8 text-center text-ink-soft">
                        <Sliders className="size-6 mx-auto text-ink-faint mb-1" />
                        <p className="text-xs">No custom attributes defined.</p>
                        <p className="text-[11px] text-ink-faint">
                          Add attributes like Brand, Model, Condition, or Power Type to standardize listings.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-border bg-canvas-alt px-6 py-3 flex items-center justify-between">
          <p className="text-[11px] text-ink-faint">
            Category ID: <span className="font-mono">{category.id}</span>
          </p>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close Inspector
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
