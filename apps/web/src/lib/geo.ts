/**
 * NEEDX Geolocation & Location Services Engine
 * Provides high-accuracy distance calculation, Indian locality dataset,
 * reverse-geocoding, and forward location search.
 */

export interface GeoLocationResult {
  cityName: string;
  state: string;
  locality?: string;
  addressLabel: string;
  lat: number;
  lng: number;
  pincode?: string;
}

export interface UserLocationState extends GeoLocationResult {
  radiusKm: number;
  isGps: boolean;
  accuracyMeters?: number;
  detectedAt?: number;
}

/**
 * Curated Indian metropolitan cities, technology corridors, and popular localities
 * with precise coordinates for high-accuracy distance calculation and offline reverse-geocoding.
 */
export const INDIAN_LOCATIONS: GeoLocationResult[] = [
  // --- Delhi NCR ---
  { cityName: 'Noida', state: 'Uttar Pradesh', locality: 'Sector 62 (Electronic City)', addressLabel: 'Sector 62, Noida, Uttar Pradesh', lat: 28.628, lng: 77.3649, pincode: '201309' },
  { cityName: 'Noida', state: 'Uttar Pradesh', locality: 'Sector 18 (Atta Market)', addressLabel: 'Sector 18, Noida, Uttar Pradesh', lat: 28.5708, lng: 77.3261, pincode: '201301' },
  { cityName: 'Noida', state: 'Uttar Pradesh', locality: 'Sector 137 (Expressway)', addressLabel: 'Sector 137, Noida, Uttar Pradesh', lat: 28.5134, lng: 77.4041, pincode: '201305' },
  { cityName: 'Greater Noida', state: 'Uttar Pradesh', locality: 'Knowledge Park', addressLabel: 'Knowledge Park, Greater Noida, Uttar Pradesh', lat: 28.4744, lng: 77.4947, pincode: '201310' },
  { cityName: 'Gurgaon', state: 'Haryana', locality: 'DLF Cyber City', addressLabel: 'DLF Cyber City, Gurgaon, Haryana', lat: 28.4952, lng: 77.0894, pincode: '122002' },
  { cityName: 'Gurgaon', state: 'Haryana', locality: 'Sector 29 (City Centre)', addressLabel: 'Sector 29, Gurgaon, Haryana', lat: 28.4682, lng: 77.0628, pincode: '122001' },
  { cityName: 'Gurgaon', state: 'Haryana', locality: 'Golf Course Road', addressLabel: 'Golf Course Road, Gurgaon, Haryana', lat: 28.4485, lng: 77.1086, pincode: '122002' },
  { cityName: 'Gurgaon', state: 'Haryana', locality: 'Sohna Road', addressLabel: 'Sohna Road, Gurgaon, Haryana', lat: 28.4089, lng: 77.0423, pincode: '122018' },
  { cityName: 'Delhi', state: 'Delhi', locality: 'Connaught Place', addressLabel: 'Connaught Place, Central Delhi, Delhi', lat: 28.6315, lng: 77.2167, pincode: '110001' },
  { cityName: 'Delhi', state: 'Delhi', locality: 'South Extension', addressLabel: 'South Extension, South Delhi, Delhi', lat: 28.5704, lng: 77.2228, pincode: '110049' },
  { cityName: 'Delhi', state: 'Delhi', locality: 'Dwarka', addressLabel: 'Dwarka, South West Delhi, Delhi', lat: 28.5921, lng: 77.046, pincode: '110075' },
  { cityName: 'Delhi', state: 'Delhi', locality: 'Rohini', addressLabel: 'Rohini, North West Delhi, Delhi', lat: 28.7166, lng: 77.1147, pincode: '110085' },
  { cityName: 'Ghaziabad', state: 'Uttar Pradesh', locality: 'Indirapuram', addressLabel: 'Indirapuram, Ghaziabad, Uttar Pradesh', lat: 28.6415, lng: 77.3714, pincode: '201014' },
  { cityName: 'Faridabad', state: 'Haryana', locality: 'Sector 15', addressLabel: 'Sector 15, Faridabad, Haryana', lat: 28.4089, lng: 77.3178, pincode: '121007' },

  // --- Bangalore / Bengaluru ---
  { cityName: 'Bangalore', state: 'Karnataka', locality: 'Koramangala', addressLabel: 'Koramangala, Bangalore, Karnataka', lat: 12.9352, lng: 77.6245, pincode: '560034' },
  { cityName: 'Bangalore', state: 'Karnataka', locality: 'Indiranagar', addressLabel: 'Indiranagar, Bangalore, Karnataka', lat: 12.9784, lng: 77.6408, pincode: '560038' },
  { cityName: 'Bangalore', state: 'Karnataka', locality: 'HSR Layout', addressLabel: 'HSR Layout, Bangalore, Karnataka', lat: 12.9121, lng: 77.6446, pincode: '560102' },
  { cityName: 'Bangalore', state: 'Karnataka', locality: 'Whitefield', addressLabel: 'Whitefield, Bangalore, Karnataka', lat: 12.9698, lng: 77.75, pincode: '560066' },
  { cityName: 'Bangalore', state: 'Karnataka', locality: 'Electronic City', addressLabel: 'Electronic City, Bangalore, Karnataka', lat: 12.8452, lng: 77.6602, pincode: '560100' },
  { cityName: 'Bangalore', state: 'Karnataka', locality: 'Jayanagar', addressLabel: 'Jayanagar, Bangalore, Karnataka', lat: 12.9308, lng: 77.5838, pincode: '560041' },

  // --- Mumbai & MMR ---
  { cityName: 'Mumbai', state: 'Maharashtra', locality: 'Bandra West', addressLabel: 'Bandra West, Mumbai, Maharashtra', lat: 19.0596, lng: 72.8295, pincode: '400050' },
  { cityName: 'Mumbai', state: 'Maharashtra', locality: 'Andheri East', addressLabel: 'Andheri East, Mumbai, Maharashtra', lat: 19.1136, lng: 72.8697, pincode: '400069' },
  { cityName: 'Mumbai', state: 'Maharashtra', locality: 'Powai (Hiranandani)', addressLabel: 'Powai, Mumbai, Maharashtra', lat: 19.1176, lng: 72.906, pincode: '400076' },
  { cityName: 'Mumbai', state: 'Maharashtra', locality: 'Colaba / Fort', addressLabel: 'Colaba, South Mumbai, Maharashtra', lat: 18.9067, lng: 72.8147, pincode: '400005' },
  { cityName: 'Thane', state: 'Maharashtra', locality: 'Ghopbander Road', addressLabel: 'Thane West, Maharashtra', lat: 19.2183, lng: 72.9781, pincode: '400601' },
  { cityName: 'Navi Mumbai', state: 'Maharashtra', locality: 'Vashi', addressLabel: 'Vashi, Navi Mumbai, Maharashtra', lat: 19.0771, lng: 72.9986, pincode: '400703' },

  // --- Pune ---
  { cityName: 'Pune', state: 'Maharashtra', locality: 'Hinjewadi Infotech Park', addressLabel: 'Hinjewadi, Pune, Maharashtra', lat: 18.5913, lng: 73.7389, pincode: '411057' },
  { cityName: 'Pune', state: 'Maharashtra', locality: 'Kothrud', addressLabel: 'Kothrud, Pune, Maharashtra', lat: 18.5074, lng: 73.8077, pincode: '411038' },
  { cityName: 'Pune', state: 'Maharashtra', locality: 'Viman Nagar', addressLabel: 'Viman Nagar, Pune, Maharashtra', lat: 18.5679, lng: 73.9143, pincode: '411014' },
  { cityName: 'Pune', state: 'Maharashtra', locality: 'Baner', addressLabel: 'Baner, Pune, Maharashtra', lat: 18.559, lng: 73.7868, pincode: '411045' },

  // --- Hyderabad ---
  { cityName: 'Hyderabad', state: 'Telangana', locality: 'Hitec City', addressLabel: 'Hitec City, Hyderabad, Telangana', lat: 17.4474, lng: 78.3762, pincode: '500081' },
  { cityName: 'Hyderabad', state: 'Telangana', locality: 'Gachibowli', addressLabel: 'Gachibowli, Hyderabad, Telangana', lat: 17.4401, lng: 78.3489, pincode: '500032' },
  { cityName: 'Hyderabad', state: 'Telangana', locality: 'Banjara Hills', addressLabel: 'Banjara Hills, Hyderabad, Telangana', lat: 17.4156, lng: 78.4357, pincode: '500034' },
  { cityName: 'Hyderabad', state: 'Telangana', locality: 'Secunderabad', addressLabel: 'Secunderabad, Telangana', lat: 17.4399, lng: 78.4983, pincode: '500003' },

  // --- Chennai ---
  { cityName: 'Chennai', state: 'Tamil Nadu', locality: 'T. Nagar', addressLabel: 'T. Nagar, Chennai, Tamil Nadu', lat: 13.0418, lng: 80.2341, pincode: '600017' },
  { cityName: 'Chennai', state: 'Tamil Nadu', locality: 'OMR (IT Corridor)', addressLabel: 'OMR, Chennai, Tamil Nadu', lat: 12.9249, lng: 80.2297, pincode: '600096' },
  { cityName: 'Chennai', state: 'Tamil Nadu', locality: 'Velachery', addressLabel: 'Velachery, Chennai, Tamil Nadu', lat: 12.9815, lng: 80.218, pincode: '600042' },
  { cityName: 'Chennai', state: 'Tamil Nadu', locality: 'Anna Nagar', addressLabel: 'Anna Nagar, Chennai, Tamil Nadu', lat: 13.085, lng: 80.2101, pincode: '600040' },

  // --- Kolkata ---
  { cityName: 'Kolkata', state: 'West Bengal', locality: 'Salt Lake (Sector V)', addressLabel: 'Salt Lake Sector V, Kolkata, West Bengal', lat: 22.5804, lng: 88.4326, pincode: '700091' },
  { cityName: 'Kolkata', state: 'West Bengal', locality: 'New Town', addressLabel: 'New Town, Kolkata, West Bengal', lat: 22.5897, lng: 88.4744, pincode: '700156' },
  { cityName: 'Kolkata', state: 'West Bengal', locality: 'Park Street', addressLabel: 'Park Street, Kolkata, West Bengal', lat: 22.5535, lng: 88.3524, pincode: '700016' },

  // --- Ahmedabad & Gujarat ---
  { cityName: 'Ahmedabad', state: 'Gujarat', locality: 'SG Highway', addressLabel: 'SG Highway, Ahmedabad, Gujarat', lat: 23.0537, lng: 72.518, pincode: '380054' },
  { cityName: 'Ahmedabad', state: 'Gujarat', locality: 'Satellite', addressLabel: 'Satellite, Ahmedabad, Gujarat', lat: 23.03, lng: 72.5178, pincode: '380015' },
  { cityName: 'Surat', state: 'Gujarat', locality: 'Vesu', addressLabel: 'Vesu, Surat, Gujarat', lat: 21.1458, lng: 72.7797, pincode: '395007' },

  // --- Other Major Metros & Tech Hubs ---
  { cityName: 'Jaipur', state: 'Rajasthan', locality: 'Malviya Nagar', addressLabel: 'Malviya Nagar, Jaipur, Rajasthan', lat: 26.8539, lng: 75.8052, pincode: '302017' },
  { cityName: 'Chandigarh', state: 'Chandigarh', locality: 'Sector 17', addressLabel: 'Sector 17, Chandigarh', lat: 30.7398, lng: 76.7827, pincode: '160017' },
  { cityName: 'Lucknow', state: 'Uttar Pradesh', locality: 'Gomti Nagar', addressLabel: 'Gomti Nagar, Lucknow, Uttar Pradesh', lat: 26.8504, lng: 80.9995, pincode: '226010' },
  { cityName: 'Indore', state: 'Madhya Pradesh', locality: 'Vijay Nagar', addressLabel: 'Vijay Nagar, Indore, Madhya Pradesh', lat: 22.7533, lng: 75.8937, pincode: '452010' },
  { cityName: 'Bhopal', state: 'Madhya Pradesh', locality: 'Arera Colony', addressLabel: 'Arera Colony, Bhopal, Madhya Pradesh', lat: 23.2156, lng: 77.4334, pincode: '462016' },
  { cityName: 'Kochi', state: 'Kerala', locality: 'Kakkanad (InfoPark)', addressLabel: 'Kakkanad, Kochi, Kerala', lat: 10.0159, lng: 76.3419, pincode: '682030' },
  { cityName: 'Coimbatore', state: 'Tamil Nadu', locality: 'RS Puram', addressLabel: 'RS Puram, Coimbatore, Tamil Nadu', lat: 11.009, lng: 76.9458, pincode: '641002' },
  { cityName: 'Visakhapatnam', state: 'Andhra Pradesh', locality: 'MVP Colony', addressLabel: 'MVP Colony, Visakhapatnam, Andhra Pradesh', lat: 17.7412, lng: 83.3328, pincode: '530017' },
  { cityName: 'Patna', state: 'Bihar', locality: 'Kankarbagh', addressLabel: 'Kankarbagh, Patna, Bihar', lat: 25.5941, lng: 85.155, pincode: '800020' },
  { cityName: 'Bhubaneswar', state: 'Odisha', locality: 'Patia', addressLabel: 'Patia, Bhubaneswar, Odisha', lat: 20.3533, lng: 85.8194, pincode: '751024' },
];

/**
 * Calculates great-circle distance between two coordinates in kilometers using Haversine formula.
 */
export function computeDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Finds the closest Indian city and locality matching given coordinates.
 */
export function findNearestLocation(lat: number, lng: number): GeoLocationResult {
  const fallback = INDIAN_LOCATIONS[0] as GeoLocationResult;
  let best: GeoLocationResult = fallback;
  let minDistance = Infinity;

  for (const loc of INDIAN_LOCATIONS) {
    const dist = computeDistanceKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      best = loc;
    }
  }

  // If very close to known locality (< 5km), use that locality name
  if (minDistance <= 5) {
    return {
      cityName: best.cityName,
      state: best.state,
      locality: best.locality,
      addressLabel: best.addressLabel,
      lat,
      lng,
      pincode: best.pincode,
    };
  }

  // Otherwise, use city name with exact coordinates
  return {
    cityName: best.cityName,
    state: best.state,
    locality: minDistance <= 25 ? `Near ${best.cityName}` : undefined,
    addressLabel: `${best.cityName}, ${best.state}`,
    lat,
    lng,
    pincode: best.pincode,
  };
}

/**
 * High-accuracy reverse geocoder:
 * Resolves GPS coordinates into an address. Works instantly offline with our geo database,
 * and seamlessly enriches with fine address data if available.
 */
export async function reverseGeocodeCoordinates(lat: number, lng: number): Promise<GeoLocationResult> {
  const fallback = findNearestLocation(lat, lng);

  try {
    // Attempt fast client reverse geocoding with 1200ms timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || fallback.cityName;
      const state = data.principalSubdivision || fallback.state;
      const locality = data.locality || fallback.locality;
      const parts = [locality, city, state].filter(Boolean);
      return {
        cityName: city,
        state,
        locality,
        addressLabel: parts.join(', '),
        lat,
        lng,
        pincode: data.postcode || fallback.pincode,
      };
    }
  } catch {
    // Graceful offline fallback
  }

  return fallback;
}

/**
 * Searches across known Indian locations, cities, localities, and states.
 */
export function searchLocations(query: string): GeoLocationResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return INDIAN_LOCATIONS.slice(0, 10);

  const matched = INDIAN_LOCATIONS.filter((loc) => {
    return (
      loc.cityName.toLowerCase().includes(q) ||
      loc.state.toLowerCase().includes(q) ||
      (loc.locality && loc.locality.toLowerCase().includes(q)) ||
      (loc.pincode && loc.pincode.includes(q))
    );
  });

  return matched.slice(0, 8);
}

/**
 * Default fallback location for the application (Noida Sector 62 / NCR Hub).
 */
export const DEFAULT_USER_LOCATION: UserLocationState = {
  cityName: 'Noida',
  state: 'Uttar Pradesh',
  locality: 'Sector 62 (Electronic City)',
  addressLabel: 'Sector 62, Noida, Uttar Pradesh',
  lat: 28.628,
  lng: 77.3649,
  pincode: '201309',
  radiusKm: 25,
  isGps: false,
};
