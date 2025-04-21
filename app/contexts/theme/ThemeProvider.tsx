'use client';
import { useState, useEffect } from 'react';
import { ThemeContext } from '@contexts/theme/ThemeContext';

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Split the initialization into a separate effect to handle hydration
  useEffect(() => {
    // Immediately set isLoaded to true on mount
    setIsLoaded(true);

    // Get initial theme preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Set initial dark mode state: default to dark if no saved theme
    setIsDark(savedTheme === 'dark' || savedTheme === null);

    // Add system theme change listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark, isLoaded]);

  // Don't render children until we've hydrated
  if (!isLoaded) {
    return null; // Or a loading fallback if needed
  }

  return (
    <ThemeContext.Provider value={{ 
      isDark, 
      toggleTheme: () => setIsDark(!isDark), 
      isLoaded 
    }}>
      {children}
    </ThemeContext.Provider>
  );
} 