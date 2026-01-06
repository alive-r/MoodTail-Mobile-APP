import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GeoAddress } from '@/api/geoapify';

const getKey = (date: string) => `@photo_meta_${date}`;

export type Locations = {
  latitude?: number;
  longitude?: number;
  address?: string;
  geo?: GeoAddress;
  capturedAt?: number;
};

export async function getLocation(date: string): Promise<Locations | null> {
  try {
    const v = await AsyncStorage.getItem(getKey(date));
    return v ? (JSON.parse(v) as Locations) : null;
  } catch (e) {
    console.error('Error reading photo meta', e);
    return null;
  }
}

export async function setLocation(date: string, meta: Locations): Promise<void> {
  try {
    await AsyncStorage.setItem(getKey(date), JSON.stringify(meta));
  } catch (e) {
    console.error('Error saving photo meta', e);
  }
}

export async function deleteLocation(date: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(getKey(date));
  } catch (e) {
    console.error('Error deleting photo meta', e);
  }
}