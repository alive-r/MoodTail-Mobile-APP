import { addScenario, deleteScenario, getScenarios } from '@/storage/scenarios';
import { Scenario } from '@/types/types';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useCalendarIndex } from './CalendarIndexContext';
import { useDate } from './DateContext';

interface SelectedScenarioContextProps {
    scenarios: Scenario[];
    reloadScenarios: () => Promise<void>;
    addScenarioItem: (Scenario: Scenario) => Promise<void>;
    deleteScenarioItem: (id: string) => Promise<void>;
    isSelected: (id: string) => boolean;
}

const SelectedScenarioContext = createContext<SelectedScenarioContextProps | undefined>(undefined);

export function SelectedScenarioProvider({ children }: { children: ReactNode }) {
    const { selectedDate } = useDate(); 
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const { bump } = useCalendarIndex();

    const reloadScenarios = useCallback(async () => {
        const data = await getScenarios(selectedDate);
        setScenarios(data);
    }, [selectedDate]);

    const addScenarioItem = useCallback(async (Scenario: Scenario) => {
        await addScenario(Scenario, selectedDate);
        await reloadScenarios();
         await bump(selectedDate);
    }, [reloadScenarios, selectedDate, bump]);

    const deleteScenarioItem = useCallback(async (id: string) => {
        await deleteScenario(id, selectedDate);
        await reloadScenarios();
         await bump(selectedDate);
    }, [reloadScenarios, selectedDate,bump]);

    const isSelected = useCallback((id: string) => {
        return scenarios.some(d => d.id === id);
      }, [scenarios]);

    useEffect(() => {
        void reloadScenarios();
    }, [reloadScenarios]);

    return (
    <SelectedScenarioContext.Provider
        value={{ scenarios, reloadScenarios, addScenarioItem, deleteScenarioItem, isSelected }}
    >
        {children}
    </SelectedScenarioContext.Provider>
    );
}

export const useScenarios = (): SelectedScenarioContextProps => {
  const context = useContext(SelectedScenarioContext);
  if (!context) {
    throw new Error('useScenarios must be used within a SelectedScenarioProvider');
  }
  return context;
};
