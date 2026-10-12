'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
  HelpCircle,
  Lock,
  MapPin,
  MessageSquare,
  Package,
  Plus,
  RotateCcw,
  Scale,
  Share2,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Truck,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { useListing } from '@/hooks/use-listings';
import { useCurrentUser } from '@/hooks/use-auth';
import { useFavorites, useToggleFavorite } from '@/hooks/use-misc';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PublicUser } from '@needx/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/shared/price-display';
import { CardGridSkeleton } from '@/components/shared/loading-skeletons';
import { TRANSACTION_MODE_LABELS, formatDate, formatPrice, initials } from '@/lib/utils';
import { ListingGallery } from '@/components/listings/listing-gallery';
import { ListingProtectionCard } from '@/components/listings/listing-protection-card';
import { ListingSpecificationsCard } from '@/components/listings/listing-specifications';
import { ListingRentalTermsCard } from '@/components/listings/listing-rental-terms';

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: listing, isLoading } = useListing(id);
  const { data: user } = useCurrentUser();
  const { data: favorites } = useFavorites('LISTING');
  const toggleFavorite = useToggleFavorite();

  const { data: provider } = useQuery({
    queryKey: ['users', listing?.providerId],
    queryFn: () => api.get<PublicUser>(`/users/${listing!.providerId}`),
    enabled: !!listing?.providerId && /^[a-fA-F0-9]{24}$/.test(listing.providerId),
  });

  // Duration estimator state for interactive cost breakdown
  const [estimatedDays, setEstimatedDays] = useState(3);
  const [selectedHandover, setSelectedHandover] = useState<'LOCAL_PICKUP' | 'DOORSTEP_DELIVERY'>('LOCAL_PICKUP');

  if (isLoading || !listing) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-14">
        <CardGridSkeleton count={1} />
      </div>
    );
  }

  const isFavorited = favorites?.some((f) => f.targetId === listing.id) ?? false;
  const isOwnListing = user?.id === listing.providerId;

  const dailyRate = listing.price.amount;
  const deposit = listing.protection?.securityDeposit ?? listing.deposit ?? 0;
  const deliveryFee = selectedHandover === 'DOORSTEP_DELIVERY' ? (listing.rentalTerms?.deliveryFee ?? 150) : 0;
  const rentalSubtotal = listing.price.unit === 'DAY' ? dailyRate * estimatedDays : dailyRate;
  const estimatedTotal = rentalSubtotal + deliveryFee;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out ${listing.title} on NEEDX!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Listing link copied to clipboard');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb / Top Category Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-faint">
        <div className="flex items-center gap-2">
          <Link href="/listings" className="hover:text-trust transition-colors">
            Listings
          </Link>
          <span>/</span>
          <span className="font-semibold text-ink capitalize">{listing.type.toLowerCase()}</span>
          <span>/</span>
          <span className="truncate max-w-[200px] text-ink-soft">{listing.title}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="h-8 gap-1.5 text-xs">
            <Share2 className="size-3.5" /> Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!user) {
                toast('Sign in to save favorites');
                return;
              }
              toggleFavorite.mutate({ targetType: 'LISTING', targetId: listing.id, isFavorited });
            }}
            className={`h-8 gap-1.5 text-xs ${isFavorited ? 'text-danger border-danger/30' : ''}`}
          >
            <Heart className={`size-3.5 ${isFavorited ? 'fill-danger text-danger' : ''}`} />
            {isFavorited ? 'Saved' : 'Favorite'}
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid gap-8 lg:grid-cols-[1.55fr_1fr] items-start">
        {/* LEFT COLUMN: Gallery, Title, Description, Specs, Protection, Terms */}
        <div className="space-y-8">
          {/* 1. Interactive Multi-Photo Gallery */}
          <ListingGallery
            images={listing.images}
            gallery={listing.gallery}
            title={listing.title}
          />

          {/* 2. Main Title & Quick Badges */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {listing.modes.map((m) => (
                <Badge key={m} variant="trust" className="text-xs uppercase font-bold tracking-wider">
                  {TRANSACTION_MODE_LABELS[m]}
                </Badge>
              ))}
              {listing.condition && (
                <Badge variant="outline" className="text-xs font-semibold">
                  {listing.condition}
                </Badge>
              )}
              {listing.protection?.damageProtectionPlan && (
                <Badge variant="hope" className="text-xs font-bold gap-1">
                  <ShieldCheck className="size-3" />
                  {listing.protection.damageProtectionPlan} SHIELD
                </Badge>
              )}
              {listing.specifications?.serialNumberProtected && (
                <Badge variant="outline" className="text-xs gap-1 font-mono text-ink-faint">
                  <Lock className="size-2.5" /> Serial Protected
                </Badge>
              )}
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {listing.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-ink-faint">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 text-trust" />
                {listing.location.label}
              </span>
              <span>·</span>
              <span>Listed {formatDate(listing.createdAt)}</span>
              {listing.viewCount !== undefined && (
                <>
                  <span>·</span>
                  <span className="font-mono-num">{listing.viewCount} Views</span>
                </>
              )}
            </div>
          </div>

          {/* 3. Detailed Description */}
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs space-y-3">
            <h3 className="font-display text-base font-bold text-ink">About This Item</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {listing.description}
            </p>
          </div>

          {/* 4. Specifications & Condition Features */}
          <ListingSpecificationsCard
            specifications={listing.specifications}
            condition={listing.condition}
            attributes={listing.attributes}
          />

          {/* 5. Comprehensive Safety, Damage & Theft Protection Card */}
          <ListingProtectionCard
            protection={listing.protection}
            priceAmount={listing.price.amount}
            depositAmount={listing.deposit}
          />

          {/* 6. Rental Terms, Handover & Cancellation */}
          <ListingRentalTermsCard
            terms={listing.rentalTerms}
            depositAmount={listing.deposit}
          />
        </div>

        {/* RIGHT COLUMN: Sticky Booking, Cost Estimator & Trust Sidebar */}
        <div className="space-y-5 lg:sticky lg:top-24">
          {/* Main Pricing & Duration Estimator Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-md space-y-5">
            {/* Primary Price Header */}
            <div className="flex items-baseline justify-between border-b border-border/80 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">
                  {listing.type === 'RENTAL' ? 'Rental Rate' : 'Price'}
                </span>
                <PriceDisplay
                  amount={listing.price.amount}
                  currency={listing.price.currency}
                  unit={listing.price.unit}
                  className="font-display text-2xl sm:text-3xl font-bold text-ink"
                />
              </div>

              {deposit > 0 && (
                <div className="text-right">
                  <span className="text-[11px] text-ink-faint">Refundable Deposit</span>
                  <p className="font-display text-xs font-bold text-ink">
                    ₹{deposit.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-faith font-semibold">100% Escrow Refund</span>
                </div>
              )}
            </div>

            {/* Interactive Rental Calculator (if Rental mode) */}
            {listing.type === 'RENTAL' && listing.price.unit === 'DAY' && (
              <div className="rounded-xl border border-border/80 bg-canvas-alt/50 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-ink flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-trust" /> Rental Duration:
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-ink">
                    {[1, 3, 7, 14].map((d) => (
                      <button
                        key={d}
                        onClick={() => setEstimatedDays(d)}
                        className={`rounded-lg px-2 py-0.5 text-xs font-semibold transition-all ${
                          estimatedDays === d
                            ? 'bg-trust text-white shadow-xs'
                            : 'border border-border bg-surface text-ink-soft hover:bg-canvas-alt'
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                {/* Handover Option Picker */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                  <span className="text-ink-soft">Delivery Option:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedHandover('LOCAL_PICKUP')}
                      className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition-all ${
                        selectedHandover === 'LOCAL_PICKUP'
                          ? 'bg-faith text-white'
                          : 'border border-border bg-surface text-ink-soft'
                      }`}
                    >
                      Pickup (Free)
                    </button>
                    <button
                      onClick={() => setSelectedHandover('DOORSTEP_DELIVERY')}
                      className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold transition-all ${
                        selectedHandover === 'DOORSTEP_DELIVERY'
                          ? 'bg-faith text-white'
                          : 'border border-border bg-surface text-ink-soft'
                      }`}
                    >
                      Delivery (+₹{listing.rentalTerms?.deliveryFee ?? 150})
                    </button>
                  </div>
                </div>

                {/* Total Cost Breakdown */}
                <div className="pt-2 border-t border-border/60 space-y-1 text-xs">
                  <div className="flex justify-between text-ink-soft">
                    <span>
                      ₹{dailyRate.toLocaleString('en-IN')} × {estimatedDays} days
                    </span>
                    <span>₹{rentalSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-ink-soft">
                      <span>Doorstep delivery</span>
                      <span>₹{deliveryFee.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-ink pt-1 text-sm">
                    <span>Estimated Rental Total</span>
                    <span>₹{estimatedTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {deposit > 0 && (
                    <div className="flex justify-between text-[11px] text-faith pt-0.5">
                      <span>+ Refundable deposit (returned on safe return)</span>
                      <span>₹{deposit.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Primary Action Button */}
            {!isOwnListing ? (
              <div className="space-y-2">
                <Button variant="default" className="w-full h-11 text-sm font-bold bg-trust hover:bg-trust-dark text-white shadow-sm" asChild>
                  <Link href={`/providers/${listing.providerId}`}>
                    <MessageSquare className="size-4 mr-2" />
                    Contact Provider / Book Item
                  </Link>
                </Button>
                <p className="text-center text-[11px] text-ink-faint">
                  🔒 Payments &amp; deposits protected by NEEDX Escrow Shield
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Button variant="outline" className="w-full h-10 text-xs font-bold gap-1.5" asChild>
                  <Link href={`/provider/listings/${listing.id}`}>
                    <Store className="size-3.5" /> Edit &amp; Manage Listing
                  </Link>
                </Button>
                <p className="text-center text-[11px] text-faith font-medium">
                  ✓ This is your active marketplace listing
                </p>
              </div>
            )}

            {/* 3 Quick Safety Guarantees */}
            <div className="space-y-2 pt-2 border-t border-border/80 text-xs text-ink-soft">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-faith shrink-0" />
                <span>100% Escrow Protected Financial Handshake</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-trust shrink-0" />
                <span>Accidental damage &amp; theft protection cover</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="size-4 text-faith shrink-0" />
                <span>Deposit returned within 24h of safe return</span>
              </div>
            </div>
          </div>

          {/* Provider Trust Card */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-xs font-bold uppercase tracking-wider text-ink-faint">
                Verified Marketplace Provider
              </h4>
              {provider?.trust?.identityVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-trust">
                  <ShieldCheck className="size-3.5" /> Real ID Verified
                </span>
              )}
            </div>

            <Link
              href={`/providers/${listing.providerId}`}
              className="flex items-center justify-between group pt-1"
            >
              <div className="flex items-center gap-3">
                <Avatar className="size-11 ring-2 ring-trust/20 shadow-xs">
                  <AvatarImage
                    src={provider?.avatarUrl}
                    alt={provider?.provider?.businessName || provider?.name || 'Provider'}
                  />
                  <AvatarFallback className="bg-trust text-white font-bold text-sm">
                    {initials(provider?.provider?.businessName || provider?.name || listing.title)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-sm text-ink group-hover:text-trust transition-colors flex items-center gap-1.5">
                    {provider?.provider?.businessName || provider?.name || 'View Provider Profile'}
                    <ExternalLink className="size-3 text-ink-faint group-hover:text-trust" />
                  </p>
                  <p className="text-xs text-ink-faint">
                    Based in {provider?.city || listing.location.city || listing.location.label}
                  </p>
                </div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs text-ink-faint">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-faith" />
                <span>{provider?.trust?.identityVerified ? 'Govt KYC Verified' : 'Phone Verified'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="size-3.5 text-amber-500 fill-amber-400" />
                <span>
                  {provider?.trust?.ratingAverage
                    ? `${provider.trust.ratingAverage.toFixed(1)} Rating (${provider.trust.ratingCount})`
                    : 'Top Rated Provider'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
