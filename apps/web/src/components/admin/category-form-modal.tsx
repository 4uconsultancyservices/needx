'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FolderTree,
  Hash,
  Layers,
  Plus,
  Sliders,
  Sparkles,
  Tag,
  Trash2,
  Wrench,
} from 'lucide-react';
import {
  useCreateCategory,
  useUpdateCategory,
  type CategoryAdminRecord,
} from '@/hooks/use-categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { slugify } from '@/lib/utils';
import type { CategoryAttributeDef, CategoryAttributeType } from '@needx/types';

interface CategoryFormModalProps {
  category: CategoryAdminRecord | null;
  allCategories: CategoryAdminRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AVAILABLE_ICONS = [
  'folder',
  'laptop',
  'wrench',
  'sofa',
  'car',
  'party-popper',
  'home',
  'briefcase',
  'camera',
  'dumbbell',
  'graduation-cap',
  'bed-double',
  'truck',
  'printer',
  'sparkles',
  'package',
  'heart-handshake',
];

export function CategoryFormModal({
  category,
  allCategories,
  isOpen,
  onClose,
  onSuccess,
}: CategoryFormModalProps) {
  const isEditing = Boolean(category);
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  // Basic Details
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('folder');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  // Keywords
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  // Attributes
  const [attributes, setAttributes] = useState<CategoryAttributeDef[]>([]);

  // Reset or populate form
  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || '');
      setIcon(category.icon || 'folder');
      setDescription(category.description || '');
      setParentId(category.parentId || '');
      setSortOrder(category.sortOrder ?? 0);
      setIsActive(category.isActive ?? true);
      setKeywords(category.keywords ? [...category.keywords] : []);
      setAttributes(category.attributes ? JSON.parse(JSON.stringify(category.attributes)) : []);
    } else {
      setName('');
      setSlug('');
      setIcon('folder');
      setDescription('');
      setParentId('');
      setSortOrder(0);
      setIsActive(true);
      setKeywords([]);
      setAttributes([]);
    }
    setKeywordInput('');
  }, [category, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(slugify(val));
    }
  };

  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim().toLowerCase();
    if (!trimmed) return;
    if (keywords.includes(trimmed)) {
      toast.info('Keyword already added');
      return;
    }
    setKeywords([...keywords, trimmed]);
    setKeywordInput('');
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleAddAttribute = () => {
    setAttributes([
      ...attributes,
      {
        key: `field_${attributes.length + 1}`,
        label: 'New Field',
        type: 'TEXT' as CategoryAttributeType,
        required: false,
        unit: '',
        options: [],
      },
    ]);
  };

  const handleUpdateAttribute = (index: number, patch: Partial<CategoryAttributeDef>) => {
    const next = [...attributes];
    const current = next[index];
    if (current) {
      next[index] = {
        key: patch.key ?? current.key,
        label: patch.label ?? current.label,
        type: patch.type ?? current.type,
        required: patch.required ?? current.required,
        options: patch.options ?? current.options,
        unit: patch.unit ?? current.unit,
      };
      setAttributes(next);
    }
  };

  const handleRemoveAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    if (!slug.trim()) {
      toast.error('Category slug is required');
      return;
    }

    try {
      if (isEditing && category) {
        await updateCategory.mutateAsync({
          id: category.id,
          data: {
            name: name.trim(),
            slug: slug.trim().toLowerCase(),
            icon: icon.trim() || undefined,
            description: description.trim() || undefined,
            parentId: parentId || null,
            sortOrder: Number(sortOrder) || 0,
            isActive,
            keywords,
            attributes,
          },
        });
        toast.success(`Updated category: ${name}`);
      } else {
        await createCategory.mutateAsync({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          icon: icon.trim() || undefined,
          description: description.trim() || undefined,
          parentId: parentId || null,
          sortOrder: Number(sortOrder) || 0,
          keywords,
          attributes,
        });
        toast.success(`Created category: ${name}`);
      }
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save category');
    }
  };

  // Potential parent categories (exclude self if editing)
  const candidateParents = allCategories.filter((c) => !category || c.id !== category.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 border-border bg-surface text-ink shadow-2xl">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <DialogHeader className="border-b border-border bg-canvas-alt/50 p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-trust/10 text-trust border border-trust/20">
                <FolderTree className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-ink">
                  {isEditing ? `Edit Category: ${category?.name}` : 'Create New Category'}
                </DialogTitle>
                <DialogDescription className="text-xs text-ink-soft mt-0.5">
                  Configure taxonomy structure, parent inheritance, AI inference keywords, and attribute schema.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            {/* Section 1: Basic Identity */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                <FolderTree className="size-3.5 text-trust" /> 1. Category Identity &amp; Hierarchy
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-name" className="text-xs font-semibold">
                    Category Name <span className="text-danger">*</span>
                  </Label>
                  <Input
                    id="cat-name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Drone & Aerial Video"
                    className="text-xs"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cat-slug" className="text-xs font-semibold">
                    URL Slug <span className="text-danger">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint text-xs font-mono">
                      /
                    </span>
                    <Input
                      id="cat-slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase())}
                      placeholder="e.g. drone-aerial-video"
                      className="pl-6 text-xs font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cat-parent" className="text-xs font-semibold">
                    Parent Hierarchy Tier
                  </Label>
                  <select
                    id="cat-parent"
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trust"
                  >
                    <option value="">None (Top-Level Root Category)</option>
                    {candidateParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        ↳ {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cat-icon" className="text-xs font-semibold">
                    Icon Identifier
                  </Label>
                  <select
                    id="cat-icon"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full rounded-control border border-border bg-surface px-3 py-2 text-xs text-ink focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trust"
                  >
                    {AVAILABLE_ICONS.map((ico) => (
                      <option key={ico} value={ico}>
                        {ico}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cat-sort" className="text-xs font-semibold">
                    Display Sort Order
                  </Label>
                  <Input
                    id="cat-sort"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="text-xs"
                    min={0}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-desc" className="text-xs font-semibold">
                  Catalog Description
                </Label>
                <textarea
                  id="cat-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe items and services included in this marketplace taxonomy..."
                  rows={2}
                  className="w-full rounded-control border border-border bg-surface p-2.5 text-xs text-ink placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trust"
                />
              </div>

              {isEditing && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="size-4 rounded border-border text-trust focus:ring-trust"
                  />
                  <Label htmlFor="cat-active" className="text-xs font-medium cursor-pointer">
                    Publish as Active Marketplace (visible in search &amp; requests)
                  </Label>
                </div>
              )}
            </div>

            {/* Section 2: AI Need-Parser Keywords */}
            <div className="space-y-3 border-t border-border pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-trust" /> 2. AI Inference Keywords ({keywords.length})
                  </h3>
                  <p className="text-[11px] text-ink-soft">
                    Words and phrases parsed from natural customer text to infer this category automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                  placeholder="Type keyword and press Enter or Add (e.g. dslr, lens, tripod)"
                  className="text-xs"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddKeyword} className="text-xs shrink-0">
                  <Plus className="size-3.5 mr-1" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-lg border border-border bg-canvas-alt/40">
                {keywords.length > 0 ? (
                  keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-md bg-trust/10 border border-trust/20 px-2 py-0.5 text-xs font-mono text-trust"
                    >
                      <Tag className="size-3 opacity-60" />
                      {kw}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(idx)}
                        className="ml-1 text-ink-faint hover:text-danger"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-ink-faint italic p-1">
                    No keywords added yet. Add common terms customers use when requesting this category.
                  </span>
                )}
              </div>
            </div>

            {/* Section 3: Dynamic Attribute Schema Builder */}
            <div className="space-y-3 border-t border-border pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-faint flex items-center gap-1.5">
                    <Sliders className="size-3.5 text-trust" /> 3. Dynamic Attribute Specifications ({attributes.length})
                  </h3>
                  <p className="text-[11px] text-ink-soft">
                    Define custom fields (e.g. Brand, Condition, Fuel Type, Capacity) for standardized inventory &amp; demands.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddAttribute}
                  className="text-xs"
                >
                  <Plus className="size-3.5 mr-1 text-trust" /> Add Field
                </Button>
              </div>

              {attributes.length > 0 ? (
                <div className="space-y-3">
                  {attributes.map((attr, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-canvas-alt/60 p-3 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-ink flex items-center gap-1">
                          <span className="size-4 rounded-full bg-trust/10 text-trust text-[10px] flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          Field #{idx + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttribute(idx)}
                          className="h-6 w-6 p-0 text-danger hover:bg-danger-soft"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>

                      <div className="grid gap-2.5 sm:grid-cols-4">
                        <div>
                          <Label className="text-[11px] text-ink-faint">Field Key</Label>
                          <Input
                            value={attr.key}
                            onChange={(e) => handleUpdateAttribute(idx, { key: slugify(e.target.value) })}
                            placeholder="e.g. brand"
                            className="text-xs font-mono h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] text-ink-faint">Display Label</Label>
                          <Input
                            value={attr.label}
                            onChange={(e) => handleUpdateAttribute(idx, { label: e.target.value })}
                            placeholder="e.g. Brand Name"
                            className="text-xs h-8"
                          />
                        </div>

                        <div>
                          <Label className="text-[11px] text-ink-faint">Data Type</Label>
                          <select
                            value={attr.type}
                            onChange={(e) =>
                              handleUpdateAttribute(idx, {
                                type: e.target.value as CategoryAttributeType,
                              })
                            }
                            className="w-full rounded-control border border-border bg-surface px-2 py-1 text-xs text-ink h-8 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trust"
                          >
                            <option value="TEXT">Text</option>
                            <option value="NUMBER">Number</option>
                            <option value="SELECT">Single Select</option>
                            <option value="MULTISELECT">Multi Select</option>
                            <option value="BOOLEAN">Yes / No</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-3 pt-4">
                          <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(attr.required)}
                              onChange={(e) => handleUpdateAttribute(idx, { required: e.target.checked })}
                              className="size-3.5 rounded border-border text-trust"
                            />
                            Required
                          </label>
                        </div>
                      </div>

                      {/* Options or Unit if applicable */}
                      {(attr.type === 'SELECT' || attr.type === 'MULTISELECT') && (
                        <div>
                          <Label className="text-[11px] text-ink-faint">
                            Options (comma-separated, e.g. "New, Like New, Fair")
                          </Label>
                          <Input
                            value={(attr.options || []).join(', ')}
                            onChange={(e) =>
                              handleUpdateAttribute(idx, {
                                options: e.target.value
                                  .split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                            placeholder="Option 1, Option 2, Option 3"
                            className="text-xs h-8"
                          />
                        </div>
                      )}

                      {attr.type === 'NUMBER' && (
                        <div>
                          <Label className="text-[11px] text-ink-faint">Measurement Unit (optional)</Label>
                          <Input
                            value={attr.unit || ''}
                            onChange={(e) => handleUpdateAttribute(idx, { unit: e.target.value })}
                            placeholder="e.g. guests, hp, kg, mm"
                            className="text-xs h-8 max-w-xs"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border py-6 text-center text-ink-soft">
                  <p className="text-xs font-medium">No dynamic attributes configured yet.</p>
                  <p className="text-[11px] text-ink-faint">
                    Click "+ Add Field" above to specify custom requirements for this category.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="border-t border-border bg-canvas-alt px-6 py-3 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              loading={createCategory.isPending || updateCategory.isPending}
              className="bg-trust text-white hover:bg-trust-hover text-xs font-semibold"
            >
              {isEditing ? 'Save Category Changes' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
