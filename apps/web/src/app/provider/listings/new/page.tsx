'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertCircle,
  Box,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  ChevronRight,
  Info,
  Lock,
  MapPin,
  Navigation,
  Loader2,
  Package,
  Plus,
  Shield,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Trash2,
  Truck,
  Upload,
  UserCheck,
  Wallet,
  X,
} from 'lucide-react';
import { useUserLocation } from '@/contexts/location-context';
import type {
  CancellationPolicy,
  ConditionGrade,
  DamageProtectionPlan,
  GalleryImageTag,
  HandoverOption,
  ListingGalleryItem,
  ListingType,
  TransactionMode,
} from '@needx/types';
import { useCategories } from '@/hooks/use-categories';
import { useCreateListing } from '@/hooks/use-listings';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { INDIAN_CITIES, TRANSACTION_MODES } from '@/lib/constants';
import { TRANSACTION_MODE_LABELS, cn } from '@/lib/utils';
import { ApiError } from '@/lib/api-client';

const LISTING_TYPES: { value: ListingType; label: string }[] = [
  { value: 'RENTAL', label: 'Rental Equipment' },
  { value: 'PRODUCT', label: 'Product / Sale' },
  { value: 'SERVICE', label: 'Professional Service' },
];

const SAMPLE_PHOTO_KITS = [
  {
    label: 'Camera / Tech Kit',
    photos: [
      { url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80', caption: 'Front view with lens', tag: 'FRONT' as GalleryImageTag, isCover: true },
      { url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1200&q=80', caption: 'Rear LCD screen & controls', tag: 'BACK' as GalleryImageTag },
      { url: 'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=1200&q=80', caption: 'Accessories, spare battery, charger & case', tag: 'ACCESSORIES' as GalleryImageTag },
    ],
  },
  {
    label: 'Power Tool / Hardware',
    photos: [
      { url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80', caption: 'Main drill unit and battery pack', tag: 'FRONT' as GalleryImageTag, isCover: true },
      { url: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1200&q=80', caption: 'Toolbox with bit set and manual', tag: 'ACCESSORIES' as GalleryImageTag },
    ],
  },
  {
    label: 'Event & Sound Gear',
    photos: [
      { url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1200&q=80', caption: 'PA speaker setup and stands', tag: 'FRONT' as GalleryImageTag, isCover: true },
      { url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80', caption: 'Audio mixer and connector cables', tag: 'ACCESSORIES' as GalleryImageTag },
    ],
  },
];

export default function NewListingPage() {
  const router = useRouter();
  const { data: categories = [] } = useCategories();
  const createListing = useCreateListing();

  // Step state
  const [activeTab, setActiveTab] = useState<'basics' | 'gallery' | 'specs' | 'safety' | 'terms'>('basics');

  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<ListingType>('RENTAL');
  const [modes, setModes] = useState<TransactionMode[]>(['RENT']);
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('DAY');
  const { location: activeLoc, isDetecting, detectGpsLocation } = useUserLocation();
  const [cityName, setCityName] = useState(activeLoc.cityName || 'Noida');
  const [locality, setLocality] = useState(activeLoc.locality || '');
  const [coordinates, setCoordinates] = useState<[number, number] | null>(
    activeLoc.lat && activeLoc.lng ? [activeLoc.lng, activeLoc.lat] : null
  );

  const handleDetectGPS = async () => {
    const detected = await detectGpsLocation();
    if (detected) {
      setCityName(detected.cityName);
      setLocality(detected.locality || '');
      setCoordinates([detected.lng, detected.lat]);
      toast.success(`📍 Item location set to ${detected.locality || detected.cityName}`);
    }
  };

  // Gallery
  const [galleryItems, setGalleryItems] = useState<ListingGalleryItem[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageTag, setNewImageTag] = useState<GalleryImageTag>('FRONT');

  // Specifications
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [yearOrAge, setYearOrAge] = useState('');
  const [conditionGrade, setConditionGrade] = useState<ConditionGrade>('EXCELLENT');
  const [conditionNotes, setConditionNotes] = useState('');
  const [accessoriesRaw, setAccessoriesRaw] = useState('');
  const [serialProtected, setSerialProtected] = useState(true);
  const [dimensions, setDimensions] = useState('');
  const [weight, setWeight] = useState('');

  // Protection & Safety
  const [deposit, setDeposit] = useState('');
  const [replacementValue, setReplacementValue] = useState('');
  const [protectionPlan, setProtectionPlan] = useState<DamageProtectionPlan>('STANDARD');
  const [coversDamage, setCoversDamage] = useState(true);
  const [coversTheft, setCoversTheft] = useState(true);
  const [coversBreakdown, setCoversBreakdown] = useState(false);
  const [deductiblePercent, setDeductiblePercent] = useState('10');
  const [inspectionRequired, setInspectionRequired] = useState(true);
  const [idVerificationRequired, setIdVerificationRequired] = useState(true);

  // Rental Terms
  const [minDays, setMinDays] = useState('1');
  const [maxDays, setMaxDays] = useState('30');
  const [cancellationPolicy, setCancellationPolicy] = useState<CancellationPolicy>('FLEXIBLE');
  const [handoverOptions, setHandoverOptions] = useState<HandoverOption[]>(['LOCAL_PICKUP', 'DOORSTEP_DELIVERY']);
  const [deliveryFee, setDeliveryFee] = useState('150');
  const [lateFee, setLateFee] = useState('');
  const [usageGuidelines, setUsageGuidelines] = useState('');

  // Add photo to gallery
  const handleAddPhoto = () => {
    if (!newImageUrl.trim()) {
      toast.error('Please enter a valid image URL');
      return;
    }
    const item: ListingGalleryItem = {
      url: newImageUrl.trim(),
      caption: newImageCaption.trim() || undefined,
      tag: newImageTag,
      isCover: galleryItems.length === 0,
    };
    setGalleryItems((prev) => [...prev, item]);
    setNewImageUrl('');
    setNewImageCaption('');
    toast.success('Photo added to gallery');
  };

  const handleApplySampleKit = (kit: (typeof SAMPLE_PHOTO_KITS)[0]) => {
    setGalleryItems(kit.photos);
    toast.success(`Applied ${kit.label} sample photos`);
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

  const toggleHandover = (opt: HandoverOption) => {
    setHandoverOptions((prev) =>
      prev.includes(opt) ? prev.filter((x) => x !== opt) : [...prev, opt],
    );
  };

  const submit = async () => {
    const city = INDIAN_CITIES.find((c) => c.name === cityName) ?? INDIAN_CITIES[0];
    if (!title.trim() || !description.trim() || !categoryId || !price) {
      toast.error('Please complete required fields (Title, Category, Price, Description).');
      setActiveTab('basics');
      return;
    }

    const accessoriesList = accessoriesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Prepare final images array from gallery
    const images = galleryItems.map((g) => g.url);

    try {
      const listing = await createListing.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        type,
        modes,
        price: { amount: Number(price), currency: 'INR', unit: unit as never },
        deposit: deposit ? Number(deposit) : undefined,
        quantity: 1,
        condition: conditionGrade.replace('_', ' '),
        images,
        attributes: {
          brand: brand || undefined,
          model: model || undefined,
          year: yearOrAge || undefined,
        },
        location: {
          point: { type: 'Point', coordinates: (coordinates || [city.lng, city.lat]) as [number, number] },
          label: locality ? `${locality}, ${city.name}, ${city.state}` : `${city.name}, ${city.state}`,
          city: city.name,
          state: city.state,
        },
        gallery: galleryItems,
        specifications: {
          brand: brand || undefined,
          model: model || undefined,
          yearOrAge: yearOrAge || undefined,
          conditionGrade,
          conditionNotes: conditionNotes || undefined,
          serialNumberProtected: serialProtected,
          includedAccessories: accessoriesList,
          dimensionsOrSize: dimensions || undefined,
          weight: weight || undefined,
        },
        protection: {
          securityDeposit: deposit ? Number(deposit) : undefined,
          replacementValue: replacementValue ? Number(replacementValue) : Number(price) * 15,
          damageProtectionPlan: protectionPlan,
          coversAccidentalDamage: coversDamage,
          coversTheftWithFIR: coversTheft,
          coversMechanicalBreakdown: coversBreakdown,
          deductiblePercent: Number(deductiblePercent) || 10,
          inspectionRequired,
          idVerificationRequired,
        },
        rentalTerms: {
          minRentalDays: Number(minDays) || 1,
          maxRentalDays: Number(maxDays) || 30,
          cancellationPolicy,
          handoverOptions: handoverOptions.length > 0 ? handoverOptions : ['LOCAL_PICKUP'],
          deliveryFee: Number(deliveryFee) || 0,
          lateFeePerDay: lateFee ? Number(lateFee) : undefined,
          usageGuidelines: usageGuidelines || undefined,
        },
      });

      toast.success('Listing published with comprehensive safety & protection!');
      router.push(`/listings/${listing.id}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not create listing.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Create Item Listing
          </h1>
          <Badge variant="trust" className="text-xs">
            Safe Marketplace
          </Badge>
        </div>
        <p className="mt-1 text-xs text-ink-soft sm:text-sm">
          Publish your item with multi-angle photos, condition rating, and NEEDX accidental damage &amp; theft protection.
        </p>
      </div>

      {/* Structured Step Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-5 text-xs">
          <TabsTrigger value="basics" className="gap-1.5 text-xs">
            <Package className="size-3.5" /> 1. Basics
          </TabsTrigger>
          <TabsTrigger value="gallery" className="gap-1.5 text-xs">
            <Camera className="size-3.5" /> 2. Gallery ({galleryItems.length})
          </TabsTrigger>
          <TabsTrigger value="specs" className="gap-1.5 text-xs">
            <Box className="size-3.5" /> 3. Specs &amp; Gear
          </TabsTrigger>
          <TabsTrigger value="safety" className="gap-1.5 text-xs">
            <ShieldCheck className="size-3.5" /> 4. Protection
          </TabsTrigger>
          <TabsTrigger value="terms" className="gap-1.5 text-xs">
            <Calendar className="size-3.5" /> 5. Terms
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: Basics */}
        <TabsContent value="basics" className="space-y-4 pt-4">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-4">
            <div>
              <Label className="text-xs font-semibold">Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sony Alpha A7 III Full-Frame Camera with 28-70mm Lens"
                className="text-sm bg-surface"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Description *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item, key capabilities, condition highlights, and ideal use cases..."
                rows={4}
                className="text-sm bg-surface"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="bg-surface">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Listing Type *</Label>
                <Select value={type} onValueChange={(v) => setType(v as ListingType)}>
                  <SelectTrigger className="bg-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LISTING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Transaction Modes</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {TRANSACTION_MODES.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() =>
                      setModes((prev) =>
                        prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
                      )
                    }
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                      modes.includes(m)
                        ? 'border-trust bg-trust text-white shadow-xs'
                        : 'border-border bg-surface text-ink-soft hover:bg-canvas-alt',
                    )}
                  >
                    {TRANSACTION_MODE_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Price (₹) *</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 1200"
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

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-xs font-semibold">Item & Shop Location</Label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    disabled={isDetecting}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-trust hover:underline cursor-pointer"
                  >
                    {isDetecting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Navigation className="size-3.5" />
                    )}
                    <span>{isDetecting ? 'Detecting GPS...' : 'Use My Current Location'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <Select
                    value={cityName}
                    onValueChange={(val) => {
                      setCityName(val);
                      const matched = INDIAN_CITIES.find((c) => c.name === val);
                      if (matched) {
                        setCoordinates([matched.lng, matched.lat]);
                      }
                    }}
                  >
                    <SelectTrigger className="bg-surface">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_CITIES.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}, {c.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Area / Locality (e.g. Sector 62, Indiranagar)"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="bg-surface text-xs"
                  />
                </div>
                {locality && (
                  <p className="mt-1.5 text-[11px] text-ink-soft flex items-center gap-1">
                    <MapPin className="size-3 text-trust" />
                    <span>Area: <strong>{locality}</strong>, {cityName} {coordinates ? '(Precise GPS pinned)' : ''}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setActiveTab('gallery')} className="gap-1 text-xs">
                Next: Photo Gallery <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Gallery */}
        <TabsContent value="gallery" className="space-y-4 pt-4">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <Camera className="size-4 text-trust" /> Multi-Angle Item Gallery
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Add photos showcasing all sides, screen/optics, and included accessories. Clear photos prevent condition disputes.
              </p>
            </div>

            {/* Quick Demo Kits */}
            <div className="rounded-xl border border-dashed border-border bg-canvas-alt/50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-ink-soft">
                ⚡ Need sample photos for quick preview?
              </span>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_PHOTO_KITS.map((kit) => (
                  <Button
                    key={kit.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplySampleKit(kit)}
                    className="h-7 text-xs bg-surface"
                  >
                    + {kit.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Add Photo Input Form */}
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <span className="text-xs font-bold text-ink">Add Photo by Image URL</span>
              <div className="grid grid-cols-1 sm:grid-cols-[1.5fr_1fr_1fr_auto] gap-2.5 items-end">
                <div>
                  <Label className="text-[11px]">Image URL</Label>
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="text-xs bg-surface"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Caption / Description</Label>
                  <Input
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    placeholder="e.g. Front view with 24-70mm"
                    className="text-xs bg-surface"
                  />
                </div>
                <div>
                  <Label className="text-[11px]">Photo Angle Tag</Label>
                  <Select value={newImageTag} onValueChange={(v) => setNewImageTag(v as GalleryImageTag)}>
                    <SelectTrigger className="text-xs bg-surface h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FRONT">Front View</SelectItem>
                      <SelectItem value="BACK">Back View</SelectItem>
                      <SelectItem value="SIDE">Side View</SelectItem>
                      <SelectItem value="ACCESSORIES">Accessories Kit</SelectItem>
                      <SelectItem value="DEFECT_DETAIL">Condition &amp; Detail</SelectItem>
                      <SelectItem value="IN_USE">In Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={handleAddPhoto} className="h-9 text-xs gap-1 font-semibold">
                  <Plus className="size-3.5" /> Add Photo
                </Button>
              </div>
            </div>

            {/* Uploaded Photos Grid */}
            {galleryItems.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {galleryItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl border-2 overflow-hidden bg-canvas-alt shadow-xs group ${
                      item.isCover ? 'border-trust ring-2 ring-trust/20' : 'border-border'
                    }`}
                  >
                    <img src={item.url} alt={item.caption || `Photo ${idx + 1}`} className="h-32 w-full object-cover" />
                    <div className="p-2 space-y-1 bg-surface border-t border-border/80">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-ink-faint truncate">
                          {item.tag || 'Photo'}
                        </span>
                        {item.isCover && (
                          <Badge variant="trust" className="text-[9px] py-0 px-1">
                            Cover
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-soft truncate font-medium">
                        {item.caption || `Image ${idx + 1}`}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        {!item.isCover ? (
                          <button
                            type="button"
                            onClick={() => handleSetCover(idx)}
                            className="text-[10px] text-trust hover:underline font-semibold"
                          >
                            Set as cover
                          </button>
                        ) : (
                          <span className="text-[10px] text-trust font-bold">Primary</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="text-danger hover:text-danger/80"
                          title="Delete photo"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-ink-faint text-xs">
                <Camera className="size-8 mx-auto text-ink-faint/60" />
                <p className="mt-2 font-semibold">No photos added yet</p>
                <p className="text-[11px]">Add image URLs above or click a sample kit to test.</p>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setActiveTab('basics')} className="text-xs">
                Back
              </Button>
              <Button onClick={() => setActiveTab('specs')} className="gap-1 text-xs">
                Next: Specs &amp; Gear <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: Specs & Gear */}
        <TabsContent value="specs" className="space-y-4 pt-4">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <Box className="size-4 text-trust" /> Item Specifications &amp; Condition
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Clearly declare item make, condition grade, and included accessories.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-semibold">Brand / Maker</Label>
                <Input
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Sony, Bosch, Apple"
                  className="text-xs bg-surface"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Model / Series</Label>
                <Input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. A7 III, GSR 18V-50"
                  className="text-xs bg-surface"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Year / Purchase Age</Label>
                <Input
                  value={yearOrAge}
                  onChange={(e) => setYearOrAge(e.target.value)}
                  placeholder="e.g. 2023, 6 Months Old"
                  className="text-xs bg-surface"
                />
              </div>
            </div>

            {/* Condition Grade Selection */}
            <div>
              <Label className="text-xs font-semibold">Condition Rating Grade</Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1.5">
                {[
                  { value: 'BRAND_NEW' as ConditionGrade, label: 'Brand New', desc: 'Sealed & unused' },
                  { value: 'LIKE_NEW' as ConditionGrade, label: 'Like New', desc: 'No visible wear' },
                  { value: 'EXCELLENT' as ConditionGrade, label: 'Excellent', desc: 'Micro signs only' },
                  { value: 'GOOD' as ConditionGrade, label: 'Good', desc: 'Normal light wear' },
                  { value: 'FAIR' as ConditionGrade, label: 'Fair', desc: 'Visible cosmetic wear' },
                ].map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setConditionGrade(g.value)}
                    className={`rounded-xl border p-2.5 text-left transition-all ${
                      conditionGrade === g.value
                        ? 'border-trust bg-trust-soft/40 shadow-xs'
                        : 'border-border bg-surface hover:bg-canvas-alt'
                    }`}
                  >
                    <span className="block text-xs font-bold text-ink">{g.label}</span>
                    <span className="block text-[10px] text-ink-faint mt-0.5">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Condition Notes</Label>
              <Input
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                placeholder="e.g. Clean optics, minor scuff on bottom plate, pristine sensor."
                className="text-xs bg-surface"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Included Accessories (comma separated)</Label>
              <Input
                value={accessoriesRaw}
                onChange={(e) => setAccessoriesRaw(e.target.value)}
                placeholder="e.g. 2x Rechargeable Batteries, 64GB Extreme SD Card, Hard Case, Lens Hood"
                className="text-xs bg-surface"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Dimensions</Label>
                <Input
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 126.9 × 95.6 × 73.7 mm"
                  className="text-xs bg-surface"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Weight</Label>
                <Input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 650g"
                  className="text-xs bg-surface"
                />
              </div>
            </div>

            {/* Anti-theft Serial Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-trust/20 bg-trust-soft/20 p-3.5 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-trust" />
                <div>
                  <span className="font-bold text-ink">Enable Serial Number Anti-Theft Ledger</span>
                  <p className="text-[11px] text-ink-soft">
                    Registers serial number in encrypted ledger to verify during handover and prevent item swapping.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={serialProtected}
                onChange={(e) => setSerialProtected(e.target.checked)}
                className="size-4 accent-trust cursor-pointer"
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setActiveTab('gallery')} className="text-xs">
                Back
              </Button>
              <Button onClick={() => setActiveTab('safety')} className="gap-1 text-xs">
                Next: Safety &amp; Protection <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: Safety & Protection */}
        <TabsContent value="safety" className="space-y-4 pt-4">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <ShieldCheck className="size-4 text-trust" /> Damage, Theft &amp; Escrow Protection
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Configure safety safeguards to guarantee financial protection against broken, damaged, or unreturned items.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Refundable Security Deposit (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  placeholder="e.g. 3000 (Held in escrow)"
                  className="text-xs bg-surface"
                />
                <span className="text-[11px] text-ink-faint mt-1 block">
                  Refunded to customer in 24h after safe return verification.
                </span>
              </div>

              <div>
                <Label className="text-xs font-semibold">Replacement Value Cap (₹)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={replacementValue}
                  onChange={(e) => setReplacementValue(e.target.value)}
                  placeholder="e.g. 45000 (Fair market value)"
                  className="text-xs bg-surface"
                />
                <span className="text-[11px] text-ink-faint mt-1 block">
                  Maximum payout cap in case of certified theft or total destruction.
                </span>
              </div>
            </div>

            {/* Protection Plan Selection */}
            <div>
              <Label className="text-xs font-semibold">Damage Protection Tier</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1.5">
                {[
                  {
                    tier: 'STANDARD' as DamageProtectionPlan,
                    title: 'Standard Shield',
                    desc: 'Accidental drop & liquid damage cover with 10% deductible.',
                  },
                  {
                    tier: 'PREMIUM' as DamageProtectionPlan,
                    title: 'Premium Shield',
                    desc: 'Full accidental damage, mechanical breakdown, zero deductible.',
                  },
                  {
                    tier: 'NONE' as DamageProtectionPlan,
                    title: 'Provider Self-Insured',
                    desc: 'Standard deposit hold only, no platform damage subsidy.',
                  },
                ].map((plan) => (
                  <button
                    key={plan.tier}
                    type="button"
                    onClick={() => setProtectionPlan(plan.tier)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      protectionPlan === plan.tier
                        ? 'border-trust bg-trust-soft/40 shadow-xs'
                        : 'border-border bg-surface hover:bg-canvas-alt'
                    }`}
                  >
                    <span className="block text-xs font-bold text-ink">{plan.title}</span>
                    <span className="block text-[11px] text-ink-soft mt-1">{plan.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Protection Coverage Checklist */}
            <div className="rounded-xl border border-border/80 bg-canvas-alt/50 p-4 space-y-3">
              <span className="text-xs font-bold text-ink">Included Protection Guarantees:</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coversDamage}
                    onChange={(e) => setCoversDamage(e.target.checked)}
                    className="size-4 accent-trust"
                  />
                  <span>Covers Accidental Drops &amp; Physical Damage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coversTheft}
                    onChange={(e) => setCoversTheft(e.target.checked)}
                    className="size-4 accent-trust"
                  />
                  <span>Covers Theft &amp; Burglary with Police FIR Assist</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={coversBreakdown}
                    onChange={(e) => setCoversBreakdown(e.target.checked)}
                    className="size-4 accent-trust"
                  />
                  <span>Covers Normal-Use Mechanical Breakdown</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inspectionRequired}
                    onChange={(e) => setInspectionRequired(e.target.checked)}
                    className="size-4 accent-trust"
                  />
                  <span>Mandatory 6-Angle Handover Photo Checklist</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={idVerificationRequired}
                    onChange={(e) => setIdVerificationRequired(e.target.checked)}
                    className="size-4 accent-trust"
                  />
                  <span>Only Permit Government KYC / Phone-Verified Seekers to Book</span>
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setActiveTab('specs')} className="text-xs">
                Back
              </Button>
              <Button onClick={() => setActiveTab('terms')} className="gap-1 text-xs">
                Next: Rental Terms <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB 5: Terms & Handover */}
        <TabsContent value="terms" className="space-y-4 pt-4">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-display text-sm font-bold text-ink flex items-center gap-2">
                <Calendar className="size-4 text-trust" /> Rental Terms &amp; Handover
              </h3>
              <p className="text-xs text-ink-soft mt-0.5">
                Set duration bounds, delivery logistics, and cancellation rules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-semibold">Min Rental Duration (Days)</Label>
                <Input
                  type="number"
                  value={minDays}
                  onChange={(e) => setMinDays(e.target.value)}
                  placeholder="1"
                  className="text-xs bg-surface"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Max Rental Window (Days)</Label>
                <Input
                  type="number"
                  value={maxDays}
                  onChange={(e) => setMaxDays(e.target.value)}
                  placeholder="30"
                  className="text-xs bg-surface"
                />
              </div>
            </div>

            {/* Handover Methods */}
            <div>
              <Label className="text-xs font-semibold">Handover Logistics</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-1.5">
                {[
                  { opt: 'LOCAL_PICKUP' as HandoverOption, title: 'Local Pickup', desc: 'At provider hub (Free)' },
                  { opt: 'DOORSTEP_DELIVERY' as HandoverOption, title: 'Doorstep Delivery', desc: 'Direct delivery to customer' },
                  { opt: 'SHIPPING' as HandoverOption, title: 'Courier / Shipping', desc: 'Tracked insured parcel' },
                ].map((item) => (
                  <button
                    key={item.opt}
                    type="button"
                    onClick={() => toggleHandover(item.opt)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      handoverOptions.includes(item.opt)
                        ? 'border-trust bg-trust-soft/40 shadow-xs'
                        : 'border-border bg-surface hover:bg-canvas-alt'
                    }`}
                  >
                    <span className="block text-xs font-bold text-ink">{item.title}</span>
                    <span className="block text-[11px] text-ink-soft mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {handoverOptions.includes('DOORSTEP_DELIVERY') && (
              <div>
                <Label className="text-xs font-semibold">Delivery Fee (₹)</Label>
                <Input
                  type="number"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="e.g. 150"
                  className="text-xs bg-surface max-w-xs"
                />
              </div>
            )}

            {/* Cancellation Policy */}
            <div>
              <Label className="text-xs font-semibold">Cancellation Policy</Label>
              <Select value={cancellationPolicy} onValueChange={(v) => setCancellationPolicy(v as CancellationPolicy)}>
                <SelectTrigger className="bg-surface text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FLEXIBLE">Flexible — Free cancellation up to 24h prior</SelectItem>
                  <SelectItem value="MODERATE">Moderate — Free cancellation up to 48h prior</SelectItem>
                  <SelectItem value="STRICT">Strict — 50% refund up to 5 days prior</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Provider Usage Rules &amp; Guidelines</Label>
              <Textarea
                value={usageGuidelines}
                onChange={(e) => setUsageGuidelines(e.target.value)}
                placeholder="e.g. Do not use in heavy rain without weather housing. Please return fully charged. Return all cable ties."
                rows={3}
                className="text-xs bg-surface"
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setActiveTab('safety')} className="text-xs">
                Back
              </Button>
              <Button
                onClick={submit}
                disabled={createListing.isPending}
                className="gap-1.5 text-xs font-bold bg-trust hover:bg-trust-dark text-white px-6 shadow-sm"
              >
                {createListing.isPending ? 'Publishing...' : 'Publish Listing'}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
