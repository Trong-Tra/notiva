import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../storage/storage';
import { lightColors, darkColors, ThemeColors } from '../constants/colors';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.getThemeDark().then((value) => {
      setIsDark(value);
      setLoaded(true);
    });
  }, []);

  const toggleTheme = async () => {
    const next = !isDark;
    setIsDark(next);
    await storage.setThemeDark(next);
  };

  if (!loaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ colors: isDark ? darkColors : lightColors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
