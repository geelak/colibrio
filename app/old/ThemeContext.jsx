'use client';
import { createContext, useContext, useState, useEffect } from 'react';

// Theme options - simplified to just light and dark
export const ThemeOptions = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Create the context
const ThemeContext = createContext(undefined);

// Provider component
export function ThemeProvider({ children }) {
  const [activeTheme, setActiveTheme] = useState(ThemeOptions.SYSTEM);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load saved theme from localStorage on mount
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      setMounted(true);
      const savedTheme = localStorage.getItem('theme') || ThemeOptions.SYSTEM;
      setActiveTheme(savedTheme);
    }
  }, []);

  // Apply theme changes to HTML element
  useEffect(() => {
    if (!mounted) return;

    // Function to determine if system prefers dark mode
    const systemPrefersDark = () => {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    // Function to update HTML data-theme attribute
    const applyTheme = (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === ThemeOptions.SYSTEM) {
        setIsDark(systemPrefersDark());
      } else {
        setIsDark(theme === ThemeOptions.DARK);
      }
    };

    // Save theme preference to localStorage
    localStorage.setItem('theme', activeTheme);
    
    // Apply the theme
    applyTheme(activeTheme);

    // Setup listener for system preference changes
    if (activeTheme === ThemeOptions.SYSTEM) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setIsDark(mediaQuery.matches);
        // No need to change data-theme as it's still 'system'
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [activeTheme, mounted]);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    if (activeTheme === ThemeOptions.LIGHT) {
      setActiveTheme(ThemeOptions.DARK);
    } else {
      setActiveTheme(ThemeOptions.LIGHT);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      activeTheme, 
      isDark, 
      toggleTheme,
      isLoaded: mounted
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    // Add more details to the warning
    console.warn(
      'useTheme must be used within a ThemeProvider. ' +
      'Make sure the component using this hook is wrapped with ClientThemeProvider ' +
      'and has the "use client" directive if it\'s a client component.'
    );
    
    // Still return fallbacks
    return { 
      activeTheme: ThemeOptions.SYSTEM,
      isDark: false,
      toggleTheme: () => {},
      isLoaded: false
    };
  }
  
  return context;
} 