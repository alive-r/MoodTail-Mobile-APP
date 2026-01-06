import AsyncStorage from '@react-native-async-storage/async-storage';
import { Favorite } from '@/types/types';

const FAVORITES_KEY = '@favorites';

export const getFavorites = async (): Promise<Favorite[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITES_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading favorites from storage', e);
    return [];
  }
};

export const saveFavorites = async (favorites: Favorite[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(favorites);
    await AsyncStorage.setItem(FAVORITES_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving favorites to storage', e);
  }
};

export const addFavorite = async (favorite: Favorite) => {
  const favorites = await getFavorites();
  if (!favorites.some(f => f.id === favorite.id)) {
    favorites.push(favorite);
    await saveFavorites(favorites);
  }
};

export const deleteFavorite = async (id: string) => {
  const favorites = await getFavorites();
  const filtered = favorites.filter(f => f.id !== id);
  await saveFavorites(filtered);
};

