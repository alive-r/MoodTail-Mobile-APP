// storage/calendarIndex.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDrinks } from './drinks';
import { getScenarios } from './scenarios';
import { getPhoto } from './photo';

const DRINK_PREFIX = '@selected_drinks_';
const SCENARIO_PREFIX = '@Scenarios_';
const PHOTO_PREFIX = '@photo_';

//check whether the key is available and return the date in the key
function keyToDate(k: string) {
  if (k.startsWith(DRINK_PREFIX)) return k.slice(DRINK_PREFIX.length);
  if (k.startsWith(SCENARIO_PREFIX)) return k.slice(SCENARIO_PREFIX.length);
  if (k.startsWith(PHOTO_PREFIX)) return k.slice(PHOTO_PREFIX.length);
  return null;
}

// get all keys in the asyncstorage and check key one by one
// store the date in the key into set
// return a set of dates that contains data
export async function listDatesWithData(): Promise<Set<string>> {
  const keys = await AsyncStorage.getAllKeys(); 
  const set = new Set<string>();
  for (const k of keys) {
    const d = keyToDate(k);
    if (d) set.add(d);
  }
  return set;
}

// get data(drinks, scenarios, photo) under the given date
// return length of drinks, scenarios and the exsistence of photo for a specific date
export async function getDayCounts(date: string): Promise<{ drinks: number; scenarios: number; photo: boolean }> {
  const [ds, ss, p] = await Promise.all([getDrinks(date), getScenarios(date), getPhoto(date)]);
  return { drinks: ds.length, scenarios: ss.length, photo: !!p};
}

// check whether it has data on a specific date (whether it is drink, scenario or photo)
export async function hasDataOnDate(date: string): Promise<boolean> {
  const { drinks, scenarios, photo } = await getDayCounts(date);
  return drinks > 0 || scenarios > 0 || photo;
}