import { Drink } from '@/types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getKey = (date: string) => `@selected_drinks_${date}`

export const getDrinks = async (date: string): Promise<Drink[]> => {
  try {
    const json = await AsyncStorage.getItem(getKey(date));
    return json != null ? JSON.parse(json) as Drink[] : [];
  } catch (e) {
    console.error('Error reading drinks from storage', e);
    return [];
  }
};

export const saveDrinks = async (date: string, drinks: Drink[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(getKey(date), JSON.stringify(drinks));
  } catch (e) {
    console.error('Error saving drinks to storage', e);
  }
};

export const addDrink = async (drink: Drink, date: string): Promise<void> => {
  const drinks = await getDrinks(date);
  const updated = [...drinks, drink];
  await saveDrinks(date, updated);
};

export const deleteDrink = async (idDrink: string, date: string): Promise<void> => {
  const drinks = await getDrinks(date);
  const filtered = drinks.filter(d => d.id !== idDrink);
  await saveDrinks(date, filtered);
};
