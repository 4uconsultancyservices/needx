/**
 * Small, hand-maintained gazetteer of major Indian cities with centroid
 * coordinates. Stands in for a real geocoding API (Google/Mapbox), which
 * this deployment has no key for. Good enough for city-level "near me"
 * search and demo seed data; swap for real geocoding before going to
 * production — see ARCHITECTURE.md.
 */
export interface CityInfo {
  name: string;
  state: string;
  lat: number;
  lng: number;
  aliases?: string[];
}

export const INDIAN_CITIES: CityInfo[] = [
  { name: 'Delhi', state: 'Delhi', lat: 28.6139, lng: 77.209, aliases: ['new delhi'] },
  { name: 'Gurgaon', state: 'Haryana', lat: 28.4595, lng: 77.0266, aliases: ['gurugram'] },
  { name: 'Noida', state: 'Uttar Pradesh', lat: 28.5355, lng: 77.391, aliases: ['greater noida'] },
  { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, aliases: ['bengaluru'] },
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.076, lng: 72.8777, aliases: ['bombay'] },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867 },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567 },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, aliases: ['madras'] },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, aliases: ['calcutta'] },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714 },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873 },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { name: 'Chandigarh', state: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577 },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, aliases: ['cochin'] },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558 },
];

export function findCityInText(text: string): CityInfo | undefined {
  const lower = text.toLowerCase();
  let best: { city: CityInfo; index: number } | undefined;
  for (const city of INDIAN_CITIES) {
    const names = [city.name.toLowerCase(), ...(city.aliases ?? [])];
    for (const name of names) {
      const idx = lower.lastIndexOf(name);
      if (idx >= 0 && (!best || idx >= best.index)) {
        best = { city, index: idx };
      }
    }
  }
  return best?.city;
}
