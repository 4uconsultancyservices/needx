'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Box,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ExternalLink,
  Eye,
  Lock,
  Package,
  Pause,
  Play,
  Plus,
  Save,
  ShieldCheck,
  Store,
  Tag,
  Trash2,
} from 'lucide-react';
import type {
  CancellationPolicy,
  ConditionGrade,
  DamageProtectionPlan,
  GalleryImageTag,
  HandoverOption,
  ListingGalleryItem,
  ListingType,
} from '@needx/types';
import { useListing, useSetListingStatus, useUpdateListing } from '@/hooks/use-listings';
import { useCategories } from '@/hooks/use-categories';
import { useCurrentUser } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';

export default function ManageListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: listing, isLoading } = useListing(id);
  const { data: user } = useCurrentUser();
  const { data: categories = [] } = useCategories();

  const updateListing = useUpdateListing();
  const setListingStatus = useSetListingStatus();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('DAY');
  const [deposit, setDeposit] = useState('');
  const [replacementValue, setReplacementValue] = useState('');

  // Gallery
  const [galleryItems, setGalleryItems] = useState<ListingGalleryItem[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageTag, setNewImageTag] = useState<GalleryImageTag>('FRONT');

  // Specs
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [conditionGrade, setConditionGrade] = useState<ConditionGrade>('EXCELLENT');
  const [conditionNotes, setConditionNotes] = useState('');
  const [accessoriesRaw, setAccessoriesRaw] = useState('');
  const [serialProtected, setSerialProtected] = useState(true);

  // Protection
  const [protectionPlan, setProtectionPlan] = useState<DamageProtectionPlan>('STANDARD');
  const [coversDamage, setCoversDamage] = useState(true);
  const [coversTheft, setCoversTheft] = useState(true);
  const [inspectionRequired, setInspectionRequired] = useState(true);
  const [idVerificationRequired, setIdVerificationRequired] = useState(true);

  // Sync state when listing loads
  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setDescription(listing.description);
      setPrice(String(listing.price.amount));
      setUnit(listing.price.unit || 'DAY');
      setDeposit(listing.deposit ? String(listing.deposit) : '');
      setReplacementValue(listing.protection?.replacementValue ? String(listing.protection.replacementValue) : '');

      setGalleryItems(listing.gallery && listing.gallery.length > 0 ? listing.gallery : listing.images.map((url, i) => ({ url, isCover: i === 0 })));

      setBrand(listing.specifications?.brand || (typeof listing.attributes?.brand === 'string' ? listing.attributes.brand : ''));
      setModel(listing.specifications?.model || (typeof listing.attributes?.model === 'string' ? listing.attributes.model : ''));
      setConditionGrade(listing.specifications?.conditionGrade || 'EXCELLENT');
      setConditionNotes(listing.specifications?.conditionNotes || '');
      setAccessoriesRaw((listing.specifications?.includedAccessories || []).join(', '));
      setSerialProtected(Boolean(listing.specifications?.serialNumberProtected));

      if (listing.protection) {
        setProtectionPlan(listing.protection.damageProtectionPlan || 'STANDARD');
        setCoversDamage(listing.protection.coversAccidentalDamage ?? true);
        setCoversTheft(listing.protection.coversTheftWithFIR ?? true);
        setInspectionRequired(listing.protection.inspectionRequired ?? true);
        setIdVerificationRequired(listing.protection.idVerificationRequired ?? true);
      }
    }
  }, [listing]);

  if (isLoading || !listing) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <CardGridSkeleton count={1} />
      </div>
    );
  }

  // Security check: Only provider can edit
  const isOwner = user?.id === listing.providerId || user?.roles?.includes('ADMIN');

  const handleAddPhoto = () => {
    if (!newImageUrl.trim()) return;
    setGalleryItems((prev) => [
      ...prev,
      {
        url: newImageUrl.trim(),
        caption: newImageCaption.trim() || undefined,
        tag: newImageTag,
        isCover: prev.length === 0,
      },
    ]);
    setNewImageUrl('');
    setNewImageCaption('');
    toast.success('Photo added');
  };

  const handleRemovePhoto = (idx: number) => {
    setGalleryItems((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length > 0 && !updated.some((p) => p.isCover) && updated[0]) {
        updated[0].isCover = true;
      }
      return updated;
    });
  };

  const handleSetCover = (idx: number) => {
    setGalleryItems((prev) =>
      prev.map((item, i) => ({
        ...item,
        isCover: i === idx,
      })),
    );
  };

  const handleSave = async () => {
    const accessoriesList = accessoriesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateListing.mutateAsync({
        id: listing.id,
        input: {
          title: title.trim(),
          description: description.trim(),
          price: { amount: Number(price), currency: 'INR', unit: unit as any },
          deposit: deposit ? Number(deposit) : undefined,
          images: galleryItems.map((g) => g.url),
          gallery: galleryItems,
          condition: conditionGrade.replace('_', ' '),
          attributes: {
            ...listing.attributes,
            brand: brand || undefined,
            model: model || undefined,
          },
          specifications: {
            ...listing.specifications,
            brand: brand || undefined,
            model: model || undefined,
            conditionGrade,
            conditionNotes: conditionNotes || undefined,
            serialNumberProtected: serialProtected,
            includedAccessories: accessoriesList,
          },
          protection: {
            ...listing.protection,
            securityDeposit: deposit ? Number(deposit) : undefined,
            replacementValue: replacementValue ? Number(replacementValue) : undefined,
            damageProtectionPlan: protectionPlan,
            coversAccidentalDamage: coversDamage,
            coversTheftWithFIR: coversTheft,
            inspectionRequired,
            idVerificationRequired,
          },
        },
      });
      toast.success('Listing details and protection settings updated!');
    } catch {
      toast.error('Failed to update listing.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/provider/listings"
              className="text-xs text-ink-faint hover:text-ink flex items-center gap-1"
            >
              <ArrowLeft className="size-3.5" /> Back to My Listings
            </Link>
          </div>
          <div className="flex items-center gap-2.5 mt-1.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl truncate max-w-md">
              Manage: {listing.title}
            </h1>
            <Badge variant={listing.status === 'ACTIVE' ? 'faith' : 'default'} className="text-xs">
              {listing.status}
            </Badge>
          </div>
        </div>

        {/* Quick Operations Bar */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="h-8 gap-1.5 text-xs">
            <Link href={`/listings/${listing.id}`} target="_blank">
              <ExternalLink className="size-3.5" /> Public View
            </Link>
          </Button>

          {listing.status === 'ACTIVE' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setListingStatus.mutate({ id: listing.id, action: 'pause' })}
              className="h-8 gap-1 text-xs"
            >
              <Pause className="size-3.5" /> Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setListingStatus.mutate({ id: listing.id, action: 'activate' })}
              className="h-8 gap-1 text-xs text-faith"
            >
              <Play className="size-3.5" /> Activate
            </Button>
          )}

          <Button
            onClick={handleSave}
            disabled={updateListing.isPending}
            className="h-8 gap-1.5 text-xs font-bold bg-trust hover:bg-trust-dark text-white shadow-xs"
          >
            <Save className="size-3.5" />
            {updateListing.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 text-xs">
          <TabsTrigger value="basics" className="text-xs gap-1.5">
            <Package className="size-3.5" /> Basic Details
          </TabsTrigger>
          <TabsTrigger value="gallery" className="text-xs gap-1.5">
            <Camera className="size-3.5" /> Gallery ({galleryItems.length})
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-xs gap-1.5">
            <Box className="size-3.5" /> Specs &amp; Gear
          </TabsTrigger>
          <TabsTrigger value="safety" className="text-xs gap-1.5">
            <ShieldCheck className="size-3.5" /> Safety &amp; Protection
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Basics */}
        <TabsContent value="basics">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <Label className="text-xs font-semibold">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-surface text-sm" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="bg-surface text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Price (₹)</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-surface"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Pricing Unit</Label>
                <Select value={unit} onValueChange={setUnit}>
                  <SelectTrigger className="bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAY">Per Day (Rental)</SelectItem>
                    <SelectItem value="HOUR">Per Hour</SelectItem>
                    <SelectItem value="ITEM">Per Item (Buy)</SelectItem>
                    <SelectItem value="SERVICE">Per Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Gallery */}
        <TabsContent value="gallery">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-display text-sm font-bold text-ink">Manage Item Gallery Photos</h3>
              <p className="text-xs text-ink-soft">
                Upload clear photos from multiple angles to reassure customers and record condition.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-canvas-alt/40 p-4 space-y-3">
              <span className="text-xs font-bold text-ink">Add Photo URL</span>
              <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_auto] gap-2.5 items-end">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="text-xs bg-surface"
                />
                <Input
                  value={newImageCaption}
                  onChange={(e) => setNewImageCaption(e.target.value)}
                  placeholder="Caption"
                  className="text-xs bg-surface"
                />
                <Select value={newImageTag} onValueChange={(v) => setNewImageTag(v as GalleryImageTag)}>
                  <SelectTrigger className="text-xs bg-surface h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FRONT">Front View</SelectItem>
                    <SelectItem value="BACK">Back View</SelectItem>
                    <SelectItem value="SIDE">Side View</SelectItem>
                    <SelectItem value="ACCESSORIES">Accessories</SelectItem>
                    <SelectItem value="DEFECT_DETAIL">Condition Detail</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddPhoto} className="h-9 text-xs font-semibold">
                  + Add
                </Button>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {galleryItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl border-2 overflow-hidden bg-canvas-alt shadow-xs ${
                    item.isCover ? 'border-trust ring-2 ring-trust/20' : 'border-border'
                  }`}
                >
                  <img src={item.url} alt={item.caption || `Photo ${idx + 1}`} className="h-28 w-full object-cover" />
                  <div className="p-2 space-y-1 bg-surface border-t border-border">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold uppercase text-ink-faint truncate">{item.tag || 'Photo'}</span>
                      {item.isCover && (
                        <Badge variant="trust" className="text-[9px] py-0 px-1">
                          Cover
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      {!item.isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(idx)}
                          className="text-[10px] text-trust hover:underline font-semibold"
                        >
                          Make cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="text-danger hover:text-danger/80 ml-auto"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Specs */}
        <TabsContent value="specs">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Brand / Maker</Label>
                <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="text-xs bg-surface" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Model / Series</Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} className="text-xs bg-surface" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Condition Rating Grade</Label>
              <Select value={conditionGrade} onValueChange={(v) => setConditionGrade(v as ConditionGrade)}>
                <SelectTrigger className="text-xs bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRAND_NEW">Brand New — Sealed &amp; Unused</SelectItem>
                  <SelectItem value="LIKE_NEW">Like New — Flawless, no wear</SelectItem>
                  <SelectItem value="EXCELLENT">Excellent — Micro signs of use</SelectItem>
                  <SelectItem value="GOOD">Good — Normal light wear</SelectItem>
                  <SelectItem value="FAIR">Fair — Visible cosmetic wear</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Condition Notes</Label>
              <Input
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder="Describe current cosmetic & functional state..."
                className="text-xs bg-surface"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Included Accessories (comma separated)</Label>
              <Input
                value={accessoriesRaw}
                onChange={(e) => setAccessoriesRaw(e.target.value)}
                className="text-xs bg-surface"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-trust/20 bg-trust-soft/20 p-3 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-trust" />
                <span className="font-bold text-ink">Serial Number Anti-Theft Ledger Enabled</span>
              </div>
              <input
                type="checkbox"
                checked={serialProtected}
                onChange={(e) => setSerialProtected(e.target.checked)}
                className="size-4 accent-trust cursor-pointer"
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Safety & Protection */}
        <TabsContent value="safety">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Refundable Security Deposit (₹)</Label>
                <Input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="e.g. 3000"
                  className="text-xs bg-surface"
                />
                <span className="text-[11px] text-ink-faint mt-1 block">Held safely in platform escrow.</span>
              </div>

              <div>
                <Label className="text-xs font-semibold">Replacement Value Cap (₹)</Label>
                <Input
                  type="number"
                  value={replacementValue}
                  onChange={(e) => setReplacementValue(e.target.value)}
                  placeholder="e.g. 45000"
                  className="text-xs bg-surface"
                />
                <span className="text-[11px] text-ink-faint mt-1 block">Maximum total loss reimbursement cap.</span>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Damage Protection Tier</Label>
              <Select value={protectionPlan} onValueChange={(v) => setProtectionPlan(v as DamageProtectionPlan)}>
                <SelectTrigger className="text-xs bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standard Shield (Drops &amp; Liquid Damage with 10% Deductible)</SelectItem>
                  <SelectItem value="PREMIUM">Premium Shield (Zero Deductible Comprehensive Cover)</SelectItem>
                  <SelectItem value="NONE">Self-Insured / No Protection Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-xl border border-border bg-canvas-alt/50 p-4 space-y-2 text-xs">
              <span className="font-bold text-ink">Protection Guarantees:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coversDamage}
                  onChange={(e) => setCoversDamage(e.target.checked)}
                  className="size-4 accent-trust"
                />
                <span>Accidental Drops &amp; Physical Damage Cover</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={coversTheft}
                  onChange={(e) => setCoversTheft(e.target.checked)}
                  className="size-4 accent-trust"
                />
                <span>Theft &amp; Non-Return Cover with Police FIR Support</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inspectionRequired}
                  onChange={(e) => setInspectionRequired(e.target.checked)}
                  className="size-4 accent-trust"
                />
                <span>Mandatory Handover Photo Inspection Checklist</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={idVerificationRequired}
                  onChange={(e) => setIdVerificationRequired(e.target.checked)}
                  className="size-4 accent-trust"
                />
                <span>Seeker Government KYC / ID Verification Required</span>
              </label>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
