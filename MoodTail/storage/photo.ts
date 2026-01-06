import AsyncStorage from '@react-native-async-storage/async-storage';

const getKey = (date: string) => `@photo_${date}`;

export async function getPhoto(date: string): Promise<string | null> {
  try {
    const v = await AsyncStorage.getItem(getKey(date));
    return v ?? null;
  } catch (e) {
    console.error('Error reading photo', e);
    return null;
  }
}

export async function setPhoto(date: string, uri: string): Promise<void> {
  try {
    await AsyncStorage.setItem(getKey(date), uri); 
  } catch (e) {
    console.error('Error saving photo', e);
  }
}

export async function deletePhoto(date: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(getKey(date));
  } catch (e) {
    console.error('Error deleting photo', e);
  }
}
