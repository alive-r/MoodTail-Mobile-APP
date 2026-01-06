import { Colors, CustomColorSet } from "@/constants/theme";
import React, { createContext, ReactNode, useContext } from "react";
import { useColorScheme } from "react-native";

const CustomThemeContext = createContext<CustomColorSet>(Colors.light);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const scheme = useColorScheme();
  const customTheme = scheme === "dark" ? Colors.dark : Colors.light;

  return (
    <CustomThemeContext.Provider value={customTheme}>
      {children}
    </CustomThemeContext.Provider>
  );
};

export const useCustomColors = () => useContext(CustomThemeContext);
