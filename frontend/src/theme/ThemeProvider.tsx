/**
 * Theme Provider
 * Provides dynamic theme colors based on user's account type
 * Automatically updates when account type changes
 */

import React, { createContext, useContext, useMemo, ReactNode } from 'react';
import { StatusBar } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { getTheme, defaultTheme, Theme, AccountType } from './colors';

// Theme Context
const ThemeContext = createContext<Theme>(defaultTheme);

// Theme Provider Props
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Provider Component
 * Wraps the app and provides theme context based on user's account type
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Get account type from auth store
  const accountType = useAuthStore((state) => state.accountType);

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() => {
    const type: AccountType = accountType || 'individual';
    return getTheme(type);
  }, [accountType]);

  return (
    <ThemeContext.Provider value={theme}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.semantic.background.default}
      />
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 * Access the current theme colors in any component
 */
export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * useThemeColors Hook
 * Shorthand to get just the primary colors
 */
export function useThemeColors() {
  const theme = useTheme();
  return {
    primary: theme.primary,
    gray: theme.gray,
    status: theme.status,
    gradient: theme.gradient,
  };
}

/**
 * usePrimaryColor Hook
 * Get the main primary color (500 shade)
 */
export function usePrimaryColor(): string {
  const theme = useTheme();
  return theme.primary[500];
}

/**
 * useSemanticColors Hook
 * Get semantic colors for backgrounds, text, borders, etc.
 */
export function useSemanticColors() {
  const theme = useTheme();
  return theme.semantic;
}

/**
 * useAccountInfo Hook
 * Get account type information
 */
export function useAccountInfo() {
  const theme = useTheme();
  return {
    type: theme.accountType,
    name: theme.accountName,
    description: theme.accountDescription,
  };
}

/**
 * withTheme HOC
 * Higher-order component to inject theme props
 */
export function withTheme<P extends { theme: Theme }>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, 'theme'>> {
  return function WithThemeComponent(props: Omit<P, 'theme'>) {
    const theme = useTheme();
    return <Component {...(props as P)} theme={theme} />;
  };
}

// Export context for advanced usage
export { ThemeContext };
