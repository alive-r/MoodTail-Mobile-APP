import { hasDataOnDate, listDatesWithData } from '@/storage/calendarIndex';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState, } from 'react';


// this context is used for visuallizing calendar
// for exmaple, several dates that contain data are makred with a red point on the calendar component


type CalendarIndexContextProps = {
  datesWithData: Set<string>;
  refresh: () => Promise<void>;
  bump: (dateISO: string) => Promise<void>;
};

const CalendarIndexContext = createContext<CalendarIndexContextProps | undefined>(undefined);

export const CalendarIndexProvider = ({ children }: { children: ReactNode }) => {
  const [dates, setDates] = useState<Set<string>>(new Set()); //store unique dates that contains data 

  const refresh = useCallback(async () => {
    const set = await listDatesWithData(); // get a date set; dates that contain data (from asyncstorage)
    setDates(set);
  }, []);

  // 'bump' will be used when updating drinks, scenarios or photo
  // everytime we make a change on drinks/scenarios/photo, we should use bump to update dates set
  const bump = useCallback(async (dateISO: string) => {
    const flag = await hasDataOnDate(dateISO);
    setDates(prev => {
      const next = new Set(prev);
      if (flag) next.add(dateISO);
      else next.delete(dateISO);
      return next;
    });
  }, []);
  
  useEffect(() => { void refresh(); }, [refresh]);
  const value = useMemo(() => ({ datesWithData: dates, refresh, bump }), [dates, refresh, bump]);
  return <CalendarIndexContext.Provider value={value}>{children}</CalendarIndexContext.Provider>;
};

export function useCalendarIndex() {
  const ctx = useContext(CalendarIndexContext);
  if (!ctx) throw new Error('useCalendarIndex must be used within CalendarIndexProvider');
  return ctx;
}