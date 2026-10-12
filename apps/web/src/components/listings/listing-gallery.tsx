'use client';

import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Image as ImageIcon,
  Maximize2,
  Package,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react';
import type { ListingGalleryItem } from '@needx/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface ListingGalleryProps {
  images: string[];
  gallery?: ListingGalleryItem[];
  title: string;
}

const TAG_LABELS: Record<string, string> = {
  FRONT: 'Front View',
  BACK: 'Back View',
  SIDE: 'Side View',
  ACCESSORIES: 'Included Accessories',
  DEFECT_DETAIL: 'Condition & Detail',
  IN_USE: 'In Use',
};

export function ListingGallery({ images, gallery, title }: ListingGalleryProps) {
  // Combine raw images and gallery items into a unified array
  const allItems: Array<{ url: string; caption?: string; tag?: string; isCover?: boolean }> = [];

  if (gallery && gallery.length > 0) {
    allItems.push(...gallery);
  } else if (images && images.length > 0) {
    images.forEach((url, i) => {
      allItems.push({ url, isCover: i === 0 });
    });
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (allItems.length === 0) {
    return (
      <div className="flex h-72 sm:h-96 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-canvas-alt text-ink-faint">
        <Package className="size-16 stroke-1 text-ink-faint/60" />
        <p className="mt-3 text-sm font-medium">No photos uploaded for this listing</p>
        <span className="text-xs text-ink-faint">Provider has verified item condition via inspection guarantee</span>
      </div>
    );
  }

  const activeItem = (allItems[activeIndex] ?? allItems[0])!;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? allItems.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === allItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-3">
      {/* Main Hero Viewer */}
      <div className="group relative h-80 sm:h-[420px] w-full overflow-hidden rounded-2xl border border-border bg-ink/5 shadow-xs">
        <img
          src={activeItem.url}
          alt={activeItem.caption || `${title} - view ${activeIndex + 1}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
        />

        {/* Top Badges overlay */}
        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          {activeItem.isCover && (
            <Badge variant="trust" className="bg-trust/90 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              Primary Photo
            </Badge>
          )}
          {activeItem.tag && TAG_LABELS[activeItem.tag] && (
            <Badge variant="outline" className="bg-surface/85 text-[10px] font-semibold text-ink backdrop-blur-md">
              <Tag className="mr-1 size-2.5" />
              {TAG_LABELS[activeItem.tag]}
            </Badge>
          )}
        </div>

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-surface/85 text-ink shadow-sm backdrop-blur-md hover:bg-surface hover:text-trust transition-all"
          title="View full resolution photo"
        >
          <Expand className="size-4" />
        </button>

        {/* Navigation Arrows (if multiple photos) */}
        {allItems.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-surface/80 text-ink shadow-sm backdrop-blur-md hover:bg-surface hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Previous photo"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex size-9 items-center justify-center rounded-full bg-surface/80 text-ink shadow-sm backdrop-blur-md hover:bg-surface hover:scale-105 transition-all opacity-0 group-hover:opacity-100"
              aria-label="Next photo"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Bottom Counter & Caption Bar */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent p-3.5 pt-8 text-white flex items-center justify-between text-xs">
          <p className="truncate font-medium text-white/95">
            {activeItem.caption || `${title} · Photo ${activeIndex + 1} of ${allItems.length}`}
          </p>
          <span className="font-mono-num text-[11px] font-bold text-white/80 bg-ink/50 px-2 py-0.5 rounded-full shrink-0">
            {activeIndex + 1} / {allItems.length}
          </span>
        </div>
      </div>

      {/* Thumbnails Filmstrip (if more than 1 image) */}
      {allItems.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {allItems.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`group relative size-16 sm:size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-trust ring-2 ring-trust/20 scale-102'
                    : 'border-border opacity-70 hover:opacity-100 hover:border-ink-soft'
                }`}
              >
                <img
                  src={item.url}
                  alt={item.caption || `Thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {item.tag && (
                  <span className="absolute bottom-0 inset-x-0 bg-ink/75 py-0.2 text-[8px] font-bold text-white uppercase text-center truncate">
                    {item.tag.replace('_', ' ')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-5xl bg-ink/95 border-none p-4 text-white overflow-hidden">
          <DialogTitle className="sr-only">Full resolution photo viewer</DialogTitle>
          <div className="relative flex flex-col items-center justify-center min-h-[500px] max-h-[85vh]">
            <img
              src={activeItem.url}
              alt={activeItem.caption || title}
              className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
            />

            <div className="mt-4 flex items-center justify-between w-full px-2 text-xs text-white/80">
              <div>
                <p className="font-semibold text-white">{activeItem.caption || title}</p>
                {activeItem.tag && (
                  <span className="text-[11px] text-white/60">
                    Tag: {TAG_LABELS[activeItem.tag] || activeItem.tag}
                  </span>
                )}
              </div>
              <span className="font-mono text-sm font-bold bg-white/10 px-2.5 py-1 rounded-md">
                {activeIndex + 1} / {allItems.length}
              </span>
            </div>

            {/* Lightbox arrows */}
            {allItems.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
                  aria-label="Next photo"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
