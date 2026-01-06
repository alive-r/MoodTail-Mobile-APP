import dayjs from "dayjs";
import React, { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type DateContextProps = {
  today: string;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
};

export const DateContext = createContext<DateContextProps | null>(null);

export const DateProvider = ({ children }: { children: ReactNode }) => {
  const today = useMemo(() => dayjs().format("YYYY-MM-DD"), []);

  const [selectedDate, _setSelectedDate] = useState<string>(today);

  const setSelectedDate = useCallback(
    (date: string) => {
      const ok = /^\d{4}-\d{2}-\d{2}$/.test(date || "");
      _setSelectedDate(ok ? date : today);
    },
    [today]
  );

  return (
    <DateContext.Provider value={{ today, selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const ctx = useContext(DateContext);
  if (!ctx) throw new Error("useDate must be used within DateProvider");
  return ctx;
};
