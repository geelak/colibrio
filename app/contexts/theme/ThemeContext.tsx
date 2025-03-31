'use client';
import { createContext, useContext } from 'react';

export type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  isLoaded: boolean;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (process.env.NODE_ENV !== 'production' && context === undefined) {
    console.warn(
      'useTheme must be used within a ThemeProvider. ' +
      'This warning should only appear during initial render/hydration. ' +
      'If you see this warning consistently, check that:\n' +
      '1. The component using useTheme is wrapped in ClientThemeProvider\n' +
      '2. The component has the "use client" directive\n' +
      '3. The component is not being rendered before ThemeProvider is mounted'
    );
  }
  
  // Always return a valid context object to prevent runtime errors
  return context ?? {
    isDark: false,
    toggleTheme: () => {},
    isLoaded: false
  };
} 