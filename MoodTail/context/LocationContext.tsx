import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import * as Location from 'expo-location';
import { useDate } from './DateContext';
import { reverseGeocode } from '@/api/geoapify';
import { getLocation, setLocation, deleteLocation, Locations } from '@/storage/location';

type LocationContextProps = {
  meta: Locations | null;
  address?: string;
  reload: () => Promise<void>;
  captureAndSaveMeta: () => Promise<Locations | null>;
  clearMeta: () => Promise<void>;
};

const LocationContext = createContext<LocationContextProps | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const { selectedDate } = useDate();
  const [meta, setMeta] = useState<Locations | null>(null);

  const reload = useCallback(async () => {
    const m = await getLocation(selectedDate);
    setMeta(m);
  }, [selectedDate]);

  const captureAndSaveMeta = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;

    const pos = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = pos.coords;

    const geo = await reverseGeocode(latitude, longitude);
    const address =
      geo?.formatted ??
      [geo?.street, geo?.houseNumber, geo?.city, geo?.state, geo?.postcode, geo?.country]
        .filter(Boolean)
        .join(', ');

    const newMeta: Locations = {
      latitude,
      longitude,
      address,
      geo: geo ?? undefined,
      capturedAt: Date.now(),
    };
    await setLocation(selectedDate, newMeta);
    await reload();
    return newMeta;
  }, [selectedDate, reload]);

  const clearMeta = useCallback(async () => {
    await deleteLocation(selectedDate);
    await reload();
  }, [selectedDate, reload]);

  useEffect(() => { void reload(); }, [reload]);

  return (
    <LocationContext.Provider value={{ meta, address: meta?.address, reload, captureAndSaveMeta, clearMeta }}>
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}