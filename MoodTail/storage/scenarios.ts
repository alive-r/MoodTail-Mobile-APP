import AsyncStorage from '@react-native-async-storage/async-storage';
import { Scenario } from '@/types/types';

const getKey = (date: string) => `@Scenarios_${date}`

export const getScenarios = async (date: string): Promise<Scenario[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(getKey(date));
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading Scenarios from storage', e);
    return [];
  }
};

export const saveScenarios = async (date: string,Scenarios: Scenario[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(Scenarios);
    await AsyncStorage.setItem(getKey(date), jsonValue);
  } catch (e) {
    console.error('Error saving Scenarios to storage', e);
  }
};

export const addScenario = async (Scenario: Scenario, date: string) => {
  const Scenarios = await getScenarios(date);
  const updated = [...Scenarios, Scenario]
  await saveScenarios(date, updated);
};

export const deleteScenario = async (id: string, date: string) => {
  const Scenarios = await getScenarios(date);
  const filtered = Scenarios.filter(f => f.id !== id);
  await saveScenarios(date,filtered);
};
