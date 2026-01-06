import { addDrink, deleteDrink, getDrinks } from '@/storage/drinks';
import { Drink } from '@/types/types';
import { useCalendarIndex } from './CalendarIndexContext';
import { useDate } from './DateContext';
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

interface SelectedDrinkContextProps {
  drinks: Drink[];
  reloadDrinks: () => Promise<void>;
  addDrinkItem: (drink: Drink) => Promise<void>;
  deleteDrinkItem: (idDrink: string) => Promise<void>;
  isSelected: (idDrink: string) => boolean;
}

const SelectedDrinkContext = createContext<SelectedDrinkContextProps | undefined>(undefined);

export function SelectedDrinkProvider({ children }: { children: ReactNode }) {
  const { selectedDate } = useDate(); 
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const { bump } = useCalendarIndex();
  
  const reloadDrinks = useCallback(async () => {
    const data = await getDrinks(selectedDate);
    setDrinks(data);
  }, [selectedDate]);

  const addDrinkItem = useCallback(async (drink: Drink) => {
    await addDrink(drink, selectedDate);
    await reloadDrinks();
    await bump(selectedDate);
  }, [reloadDrinks, selectedDate, bump]);

  const deleteDrinkItem = useCallback(async (idDrink: string) => {
    await deleteDrink(idDrink, selectedDate);
    await reloadDrinks();
    await bump(selectedDate);
  }, [reloadDrinks, selectedDate,bump]);

  const isSelected = useCallback((idDrink: string) => {
    return drinks.some(d => d.id === idDrink);
  }, [drinks]);

  useEffect(() => {
    void reloadDrinks();
  }, [reloadDrinks]);

  return (
    <SelectedDrinkContext.Provider
      value={{ drinks, reloadDrinks, addDrinkItem, deleteDrinkItem, isSelected }}
    >
      {children}
    </SelectedDrinkContext.Provider>
  );
}

export const useSelectedDrink = () => {
  const ctx = useContext(SelectedDrinkContext);
  if (!ctx) throw new Error('useSelectedDrink must be used within SelectedDrinkProvider');
  return ctx;
};