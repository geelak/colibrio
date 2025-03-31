'use client';

import { ThemeProvider } from '@contexts/ThemeContext';

export default function ClientThemeProvider({ children }) {
  return <ThemeProvider>{children}</ThemeProvider>;
} 