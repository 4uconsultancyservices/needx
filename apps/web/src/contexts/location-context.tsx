'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  type GeoLocationResult,
  type UserLocationState,
  DEFAULT_USER_LOCATION,
  reverseGeocodeCoordinates,
  computeDistanceKm,
} from '@/lib/geo';

interface LocationContextType {
  location: UserLocationState;
  isDetecting: boolean;
  error: string | null;
  detectGpsLocation: () => Promise<UserLocationState | null>;
  setLocation: (loc: GeoLocationResult, radiusKm?: number) => void;
  setRadius: (radiusKm: number) => void;
  resetToDefault: () => void;
  getDistanceTo: (lat?: number, lng?: number) => number | undefined;
}

const LocationContext = React.createContext<LocationContextType | undefined>(undefined);

const STORAGE_KEY = 'needx_user_location_v1';

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = React.useState<UserLocationState>(DEFAULT_USER_LOCATION);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Restore saved location from localStorage on client mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as UserLocationState;
        if (parsed.lat && parsed.lng && parsed.cityName) {
          setLocationState(parsed);
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  // Save to localStorage whenever location changes
  const saveLocation = React.useCallback((newLoc: UserLocationState) => {
    setLocationState(newLoc);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLoc));
    } catch {
      // ignore storage errors
    }
  }, []);

  /**
   * Acquire live GPS coordinates from the browser and reverse-geocode to human address.
   */
  const detectGpsLocation = React.useCallback(async (): Promise<UserLocationState | null> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const err = 'Geolocation is not supported by your browser.';
      setError(err);
      toast.error(err);
      return null;
    }

    setIsDetecting(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          try {
            const geoResult = await reverseGeocodeCoordinates(latitude, longitude);
            const newState: UserLocationState = {
              ...geoResult,
              radiusKm: location.radiusKm || 25,
              isGps: true,
              accuracyMeters: Math.round(accuracy),
              detectedAt: Date.now(),
            };

            saveLocation(newState);
            setIsDetecting(false);
            toast.success(`📍 Location set: ${newState.locality || newState.cityName}`, {
              description: newState.addressLabel,
            });
            resolve(newState);
          } catch {
            setIsDetecting(false);
            toast.error('Could not resolve address from coordinates.');
            resolve(null);
          }
        },
        (geoError) => {
          setIsDetecting(false);
          let message = 'Unable to retrieve location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            message = 'Location access denied. Please enable location permissions in your browser or select a city manually.';
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            message = 'GPS location is temporarily unavailable.';
          } else if (geoError.code === geoError.TIMEOUT) {
            message = 'Location request timed out. Please try again or select manually.';
          }
          setError(message);
          toast.error(message);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 120000,
        }
      );
    });
  }, [location.radiusKm, saveLocation]);

  /**
   * Manually select or switch to a city or locality.
   */
  const setLocation = React.useCallback(
    (loc: GeoLocationResult, radiusKm?: number) => {
      const newState: UserLocationState = {
        ...loc,
        radiusKm: radiusKm !== undefined ? radiusKm : location.radiusKm,
        isGps: false,
        detectedAt: Date.now(),
      };
      saveLocation(newState);
      toast.info(`📍 Location set to ${newState.cityName}`);
    },
    [location.radiusKm, saveLocation]
  );

  /**
   * Adjust distance filter radius (in km).
   */
  const setRadius = React.useCallback(
    (radiusKm: number) => {
      const newState: UserLocationState = {
        ...location,
        radiusKm,
      };
      saveLocation(newState);
    },
    [location, saveLocation]
  );

  /**
   * Reset to default hub location.
   */
  const resetToDefault = React.useCallback(() => {
    saveLocation(DEFAULT_USER_LOCATION);
    toast.info('Location reset to default hub');
  }, [saveLocation]);

  /**
   * Helper to calculate distance from current active location to a target coordinate.
   */
  const getDistanceTo = React.useCallback(
    (lat?: number, lng?: number): number | undefined => {
      if (lat === undefined || lng === undefined) return undefined;
      return computeDistanceKm(location.lat, location.lng, lat, lng);
    },
    [location.lat, location.lng]
  );

  const value = React.useMemo(
    () => ({
      location,
      isDetecting,
      error,
      detectGpsLocation,
      setLocation,
      setRadius,
      resetToDefault,
      getDistanceTo,
    }),
    [location, isDetecting, error, detectGpsLocation, setLocation, setRadius, resetToDefault, getDistanceTo]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation(): LocationContextType {
  const context = React.useContext(LocationContext);
  if (!context) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
}
