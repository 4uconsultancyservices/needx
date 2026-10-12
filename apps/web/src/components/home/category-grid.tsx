'use client';

import Link from 'next/link';
import {
  Armchair, Briefcase, Camera, Car, Dumbbell, GraduationCap, Home as HomeIcon,
  Laptop, PartyPopper, Printer, Truck, Wrench, BedDouble, MoreHorizontal, type LucideIcon,
} from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';

const ICONS: Record<string, LucideIcon> = {
  laptop: Laptop,
  wrench: Wrench,
  sofa: Armchair,
  car: Car,
  'party-popper': PartyPopper,
  home: HomeIcon,
  briefcase: Briefcase,
  camera: Camera,
  dumbbell: Dumbbell,
  'graduation-cap': GraduationCap,
  'bed-double': BedDouble,
  truck: Truck,
  printer: Printer,
  ellipsis: MoreHorizontal,
};

export function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Popular categories</h2>
          <p className="mt-1 text-sm text-ink-soft">Everything from event gear to home services.</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {isLoading
          ? Array.from({ length: 14 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-card" />)
          : categories?.map((category) => {
              const Icon = ICONS[category.icon ?? ''] ?? MoreHorizontal;
              return (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group card-surface flex flex-col items-center gap-2.5 p-4 text-center transition-all hover:shadow-card-hover hover:border-hope/30 active:scale-95"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-hope-soft/80 text-hope border border-hope/15 transition-all duration-300 group-hover:scale-105 group-hover:bg-hope group-hover:text-white">
                    <Icon className="size-5 transition-transform duration-300 group-hover:scale-110" />
                  </span>
                  <span className="text-xs font-semibold leading-tight text-ink-soft group-hover:text-hope transition-colors line-clamp-2">
                    {category.name}
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
