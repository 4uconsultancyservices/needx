'use client';

import * as React from 'react';
import {
  MapPin,
  Navigation,
  Search,
  ChevronDown,
  Compass,
  Check,
  Loader2,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useUserLocation } from '@/contexts/location-context';
import { INDIAN_LOCATIONS, searchLocations, type GeoLocationResult } from '@/lib/geo';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km', desc: 'Hyperlocal' },
  { value: 15, label: '15 km', desc: 'Citywide' },
  { value: 25, label: '25 km', desc: 'Metro Area' },
  { value: 50, label: '50 km', desc: 'Regional' },
  { value: 0, label: 'All India', desc: 'Nationwide' },
];

const POPULAR_CITIES = [
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.391 },
  { name: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266 },
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209 },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
];

export function LocationSelector({ variant = 'navbar', className }: { variant?: 'navbar' | 'compact' | 'hero'; className?: string }) {
  const { location, isDetecting, detectGpsLocation, setLocation, setRadius } = useUserLocation();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const searchResults = React.useMemo(() => {
    return searchLocations(searchQuery);
  }, [searchQuery]);

  const handleSelectLocation = (loc: GeoLocationResult) => {
    setLocation(loc);
    setOpen(false);
    setSearchQuery('');
  };

  const handleDetectGPS = async () => {
    const detected = await detectGpsLocation();
    if (detected) {
      setOpen(false);
      setSearchQuery('');
    }
  };

  const radiusLabel = location.radiusKm === 0 ? 'All India' : `${location.radiusKm} km`;
  const displayLabel = location.locality
    ? `${location.locality}, ${location.cityName}`
    : `${location.cityName}, ${location.state}`;

  return (
    <>
      {/* Trigger Button */}
      {variant === 'navbar' && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'group flex items-center gap-1 sm:gap-1.5 rounded-full border border-border/80 bg-canvas-alt/70 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-medium text-ink transition-all hover:border-hope/40 hover:bg-hope-soft/20 cursor-pointer shadow-xs shrink min-w-0 max-w-[125px] xs:max-w-[155px] sm:max-w-none',
            className
          )}
          title={`Active Location: ${location.addressLabel} (within ${radiusLabel})`}
        >
          <div className="flex size-4.5 sm:size-5 shrink-0 items-center justify-center rounded-full bg-trust/15 text-trust">
            {location.isGps ? (
              <Navigation className="size-2.5 sm:size-3 text-trust animate-pulse" />
            ) : (
              <MapPin className="size-2.5 sm:size-3 text-trust" />
            )}
          </div>
          <span className="max-w-[55px] xs:max-w-[85px] sm:max-w-[120px] md:max-w-[150px] truncate text-ink font-semibold">
            {location.locality ? location.locality.split(' ')[0] : location.cityName}
          </span>
          <span className="text-[11px] text-ink-faint hidden lg:inline">
            · {radiusLabel}
          </span>
          <ChevronDown className="size-3 text-ink-faint transition-transform group-hover:translate-y-0.5 shrink-0 hidden xs:inline" />
        </button>
      )}

      {variant === 'compact' && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-hope transition-colors"
        >
          <MapPin className="size-3.5 text-trust" />
          <span className="font-medium underline underline-offset-2">
            {location.cityName} ({radiusLabel})
          </span>
        </button>
      )}

      {variant === 'hero' && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-medium text-ink shadow-sm hover:border-hope/40 hover:shadow-md transition-all"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-trust/10 text-trust">
            <Compass className="size-4" />
          </div>
          <div className="text-left">
            <div className="text-[10px] text-ink-faint uppercase font-bold tracking-wider">Location & Radius</div>
            <div className="font-semibold text-ink text-sm">
              {location.cityName} · <span className="text-trust">{radiusLabel}</span>
            </div>
          </div>
          <ChevronDown className="ml-auto size-4 text-ink-faint" />
        </button>
      )}

      {/* Modal Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[94vw] max-w-md sm:max-w-lg p-0 overflow-hidden rounded-2xl max-h-[90vh] flex flex-col">
          <div className="bg-gradient-to-r from-trust/10 via-hope/10 to-transparent p-4 sm:p-5 border-b border-border/80 shrink-0">
            <DialogHeader>
              <div className="flex items-center gap-2 text-trust">
                <Compass className="size-5" />
                <DialogTitle className="font-display text-base sm:text-lg font-bold text-ink">
                  Set Your Location & Radius
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-ink-soft mt-1">
                NEEDX matches you with real verified items, equipment, and community needs near you.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-5 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
            {/* Primary GPS Button */}
            <Button
              type="button"
              variant="default"
              onClick={handleDetectGPS}
              disabled={isDetecting}
              className="w-full h-12 bg-gradient-to-r from-trust to-trust-dark hover:from-trust-dark hover:to-trust text-white font-semibold shadow-md flex items-center justify-center gap-2 rounded-xl"
            >
              {isDetecting ? (
                <>
                  <Loader2 className="size-4.5 animate-spin" />
                  <span>Detecting GPS Coordinates...</span>
                </>
              ) : (
                <>
                  <Navigation className="size-4.5" />
                  <span>Use My Current GPS Location</span>
                </>
              )}
            </Button>

            {/* Current Active Location Card */}
            <div className="rounded-xl border border-trust/30 bg-trust/5 p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-trust/20 text-trust">
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-ink truncate">
                    {displayLabel}
                  </div>
                  <div className="text-[11px] text-ink-soft truncate">
                    {location.isGps ? '✓ Detected via Device GPS' : 'Manually selected'} · Radius: {radiusLabel}
                  </div>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-trust/15 px-2.5 py-0.5 text-[10px] font-bold text-trust uppercase tracking-wider">
                Active
              </span>
            </div>

            {/* Distance Filter Radius */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <label className="font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="size-3 text-ink-faint" />
                  Distance Filter Radius
                </label>
                <span className="font-semibold text-trust">{radiusLabel}</span>
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-1.5">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRadius(opt.value)}
                    className={`flex flex-col items-center justify-center rounded-lg border py-1.5 sm:py-2 px-1 text-center transition-all cursor-pointer ${
                      location.radiusKm === opt.value
                        ? 'border-trust bg-trust/10 text-trust font-bold shadow-xs'
                        : 'border-border bg-canvas hover:bg-canvas-alt text-ink-soft'
                    }`}
                  >
                    <span className="text-[11px] sm:text-xs font-semibold leading-tight">{opt.label}</span>
                    <span className="text-[9px] text-ink-faint hidden sm:inline">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                Search City or Locality
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-faint" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E.g. Sector 62, Koramangala, Cyber City, Indiranagar, Bandra..."
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-9 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-trust focus:outline-none focus:ring-1 focus:ring-trust"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Results / Popular Cities */}
            <div>
              <div className="text-[11px] font-semibold text-ink-faint uppercase tracking-wider mb-2">
                {searchQuery ? `Search Results (${searchResults.length})` : 'Popular Hubs & Cities'}
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {searchQuery ? (
                  searchResults.length === 0 ? (
                    <div className="text-center py-4 text-xs text-ink-faint">
                      No matching locality found. Try searching by city name.
                    </div>
                  ) : (
                    searchResults.map((loc) => {
                      const isSelected =
                        location.cityName === loc.cityName &&
                        (!loc.locality || location.locality === loc.locality);
                      return (
                        <button
                          key={`${loc.cityName}-${loc.locality || ''}-${loc.lat}`}
                          type="button"
                          onClick={() => handleSelectLocation(loc)}
                          className={`w-full flex items-center justify-between rounded-lg p-2.5 text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-trust/10 text-trust font-medium border border-trust/30'
                              : 'bg-canvas hover:bg-canvas-alt border border-border text-ink'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="size-3.5 shrink-0 text-trust" />
                            <div className="truncate text-xs">
                              <span className="font-bold text-ink">
                                {loc.locality ? `${loc.locality}, ` : ''}
                              </span>
                              <span>{loc.cityName}, {loc.state}</span>
                            </div>
                          </div>
                          {isSelected && <Check className="size-3.5 text-trust shrink-0" />}
                        </button>
                      );
                    })
                  )
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_CITIES.map((c) => {
                      const isSelected = location.cityName === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() =>
                            handleSelectLocation({
                              cityName: c.name,
                              state: c.state,
                              addressLabel: `${c.name}, ${c.state}`,
                              lat: c.lat,
                              lng: c.lng,
                            })
                          }
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer border ${
                            isSelected
                              ? 'bg-trust text-white border-trust shadow-xs'
                              : 'bg-surface hover:bg-canvas-alt text-ink border-border'
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
