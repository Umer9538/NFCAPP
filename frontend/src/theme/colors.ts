/**
 * Dynamic Color Theme System
 * Colors change based on user's account type
 */

import type { AccountType } from '@/config/dashboardConfig';

// Base colors that don't change regardless of account type
export const baseColors = {
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Gray scale (consistent across all themes)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Status colors (always the same for accessibility)
  status: {
    success: '#22c55e',
    successLight: '#dcfce7',
    successDark: '#15803d',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    warningDark: '#b45309',
    error: '#ef4444',
    errorLight: '#fee2e2',
    errorDark: '#b91c1c',
    info: '#3b82f6',
    infoLight: '#dbeafe',
    infoDark: '#1d4ed8',
  },
};

// Primary color palette type
export interface PrimaryPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // Main brand color
  600: string;
  700: string;
  800: string;
  900: string;
}

// Account type specific brand colors
export const accountThemes: Record<AccountType, {
  name: string;
  description: string;
  primary: PrimaryPalette;
  gradient: [string, string];
}> = {
  individual: {
    name: 'Individual',
    description: 'Health and emergency care',
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main brand color - Red
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    gradient: ['#ef4444', '#dc2626'],
  },
  corporate: {
    name: 'Corporate',
    description: 'Professionalism and reliability',
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main brand color - Blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gradient: ['#3b82f6', '#2563eb'],
  },
  construction: {
    name: 'Construction',
    description: 'Safety and high visibility',
    primary: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Main brand color - Orange
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    gradient: ['#f97316', '#ea580c'],
  },
  education: {
    name: 'Education',
    description: 'Growth and community',
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main brand color - Green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    gradient: ['#22c55e', '#16a34a'],
  },
};

// Complete theme type
export interface Theme {
  // Account info
  accountType: AccountType;
  accountName: string;
  accountDescription: string;

  // Primary colors (dynamic based on account type)
  primary: PrimaryPalette;
  gradient: [string, string];

  // Base colors (static)
  white: string;
  black: string;
  transparent: string;
  gray: typeof baseColors.gray;
  status: typeof baseColors.status;

  // Semantic colors (derived from primary)
  semantic: {
    // Backgrounds
    background: {
      default: string;
      secondary: string;
      tertiary: string;
      accent: string;
    };
    // Surfaces
    surface: {
      default: string;
      elevated: string;
      sunken: string;
    };
    // Text
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
      brand: string;
    };
    // Borders
    border: {
      default: string;
      light: string;
      strong: string;
      brand: string;
    };
    // Interactive
    interactive: {
      primary: string;
      primaryHover: string;
      primaryPressed: string;
      primaryDisabled: string;
      secondary: string;
      secondaryHover: string;
    };
  };
}

/**
 * Get complete theme object for an account type
 */
export function getTheme(accountType: AccountType): Theme {
  const themeConfig = accountThemes[accountType];
  const { primary, gradient, name, description } = themeConfig;

  return {
    // Account info
    accountType,
    accountName: name,
    accountDescription: description,

    // Primary colors
    primary,
    gradient,

    // Base colors
    white: baseColors.white,
    black: baseColors.black,
    transparent: baseColors.transparent,
    gray: baseColors.gray,
    status: baseColors.status,

    // Semantic colors
    semantic: {
      background: {
        default: baseColors.white,
        secondary: baseColors.gray[50],
        tertiary: baseColors.gray[100],
        accent: primary[50],
      },
      surface: {
        default: baseColors.white,
        elevated: baseColors.white,
        sunken: baseColors.gray[50],
      },
      text: {
        primary: baseColors.gray[900],
        secondary: baseColors.gray[600],
        tertiary: baseColors.gray[500],
        inverse: baseColors.white,
        brand: primary[600],
      },
      border: {
        default: baseColors.gray[200],
        light: baseColors.gray[100],
        strong: baseColors.gray[300],
        brand: primary[500],
      },
      interactive: {
        primary: primary[500],
        primaryHover: primary[600],
        primaryPressed: primary[700],
        primaryDisabled: primary[300],
        secondary: primary[100],
        secondaryHover: primary[200],
      },
    },
  };
}

/**
 * Get just the primary color palette for an account type
 */
export function getPrimaryColors(accountType: AccountType): PrimaryPalette {
  return accountThemes[accountType].primary;
}

/**
 * Get gradient colors for an account type
 */
export function getGradientColors(accountType: AccountType): [string, string] {
  return accountThemes[accountType].gradient;
}

// Default theme (individual/red)
export const defaultTheme = getTheme('individual');

// Export for convenience
export type { AccountType };
