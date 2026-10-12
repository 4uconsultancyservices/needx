import { MapPin } from 'lucide-react';

export function LocationDisplay({ label, distanceKm }: { label: string; distanceKm?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-faint">
      <MapPin className="size-3.5" />
      {label}
      {distanceKm !== undefined && <span className="text-ink-soft">· {distanceKm} km away</span>}
    </span>
  );
}
