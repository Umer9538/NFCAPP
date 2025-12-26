/**
 * React Native Paper Theme Configuration
 * Integrating Material Design 3 with MedGuard design system
 */

import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { PRIMARY, GRAY, SEMANTIC, DARK, STATUS } from '@/constants/colors';
import { typography } from './theme';

/**
 * Font Configuration for React Native Paper
 */
const fontConfig = {
  displayLarge: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize['5xl'] * typography.lineHeight.tight,
  },
  displayMedium: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize['4xl'] * typography.lineHeight.tight,
  },
  displaySmall: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
  },
  headlineLarge: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize['2xl'] * typography.lineHeight.snug,
  },
  headlineMedium: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.xl * typography.lineHeight.snug,
  },
  headlineSmall: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  titleLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  titleMedium: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  titleSmall: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  bodyLarge: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  bodyMedium: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
  },
  labelLarge: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  labelMedium: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  labelSmall: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
  },
} as const;

/**
 * Light Theme for React Native Paper
 */
export const paperLightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Primary colors (Red brand color)
    primary: PRIMARY[600],
    primaryContainer: PRIMARY[100],
    onPrimary: '#ffffff',
    onPrimaryContainer: PRIMARY[900],

    // Secondary colors
    secondary: GRAY[600],
    secondaryContainer: GRAY[100],
    onSecondary: '#ffffff',
    onSecondaryContainer: GRAY[900],

    // Tertiary colors
    tertiary: PRIMARY[500],
    tertiaryContainer: PRIMARY[50],
    onTertiary: '#ffffff',
    onTertiaryContainer: PRIMARY[800],

    // Error colors
    error: STATUS.error.main,
    errorContainer: STATUS.error.light,
    onError: '#ffffff',
    onErrorContainer: STATUS.error.text,

    // Background colors
    background: SEMANTIC.background.default,
    onBackground: SEMANTIC.text.primary,

    // Surface colors
    surface: SEMANTIC.surface.default,
    onSurface: SEMANTIC.text.primary,
    surfaceVariant: SEMANTIC.background.secondary,
    onSurfaceVariant: SEMANTIC.text.secondary,
    surfaceDisabled: SEMANTIC.background.tertiary,
    onSurfaceDisabled: SEMANTIC.text.disabled,

    // Outline colors
    outline: SEMANTIC.border.default,
    outlineVariant: SEMANTIC.border.light,

    // Inverse colors
    inverseSurface: GRAY[900],
    inverseOnSurface: GRAY[50],
    inversePrimary: PRIMARY[400],

    // Shadow
    shadow: '#000000',
    scrim: 'rgba(0, 0, 0, 0.5)',

    // Backdrop
    backdrop: SEMANTIC.background.overlay,

    // Elevation colors (for elevated surfaces)
    elevation: {
      level0: 'transparent',
      level1: SEMANTIC.surface.default,
      level2: SEMANTIC.surface.elevated,
      level3: SEMANTIC.surface.elevated,
      level4: SEMANTIC.surface.elevated,
      level5: SEMANTIC.surface.elevated,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};

/**
 * Dark Theme for React Native Paper
 */
export const paperDarkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Primary colors (Red brand color - lighter for dark mode)
    primary: PRIMARY[500],
    primaryContainer: PRIMARY[900],
    onPrimary: PRIMARY[950],
    onPrimaryContainer: PRIMARY[100],

    // Secondary colors
    secondary: GRAY[400],
    secondaryContainer: GRAY[800],
    onSecondary: GRAY[950],
    onSecondaryContainer: GRAY[100],

    // Tertiary colors
    tertiary: PRIMARY[400],
    tertiaryContainer: PRIMARY[800],
    onTertiary: PRIMARY[950],
    onTertiaryContainer: PRIMARY[50],

    // Error colors
    error: STATUS.error.main,
    errorContainer: STATUS.error.dark,
    onError: '#ffffff',
    onErrorContainer: STATUS.error.light,

    // Background colors
    background: DARK.background.default,
    onBackground: DARK.text.primary,

    // Surface colors
    surface: DARK.surface.default,
    onSurface: DARK.text.primary,
    surfaceVariant: DARK.background.secondary,
    onSurfaceVariant: DARK.text.secondary,
    surfaceDisabled: DARK.background.tertiary,
    onSurfaceDisabled: DARK.text.disabled,

    // Outline colors
    outline: DARK.border.default,
    outlineVariant: DARK.border.light,

    // Inverse colors
    inverseSurface: GRAY[100],
    inverseOnSurface: GRAY[900],
    inversePrimary: PRIMARY[600],

    // Shadow
    shadow: '#000000',
    scrim: 'rgba(0, 0, 0, 0.8)',

    // Backdrop
    backdrop: DARK.background.overlay,

    // Elevation colors (for elevated surfaces)
    elevation: {
      level0: 'transparent',
      level1: DARK.surface.default,
      level2: DARK.surface.elevated,
      level3: DARK.surface.elevated,
      level4: DARK.surface.elevated,
      level5: DARK.surface.elevated,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 8,
};

/**
 * Custom theme additions (not part of MD3 spec)
 */
export const customTheme = {
  // Medical category colors
  medical: {
    blood: {
      background: '#fee2e2',
      text: '#7f1d1d',
      icon: '#dc2626',
    },
    medication: {
      background: '#dbeafe',
      text: '#1e40af',
      icon: '#3b82f6',
    },
    allergy: {
      background: '#fef3c7',
      text: '#92400e',
      icon: '#f59e0b',
    },
    condition: {
      background: '#f3e8ff',
      text: '#6b21a8',
      icon: '#a855f7',
    },
    contact: {
      background: '#dcfce7',
      text: '#166534',
      icon: '#22c55e',
    },
  },

  // NFC tag status colors
  nfc: {
    active: {
      background: '#dcfce7',
      text: '#166534',
      icon: '#22c55e',
    },
    inactive: {
      background: '#f3f4f6',
      text: '#6b7280',
      icon: '#9ca3af',
    },
    scanning: {
      background: '#dbeafe',
      text: '#1e40af',
      icon: '#3b82f6',
    },
  },

  // Button variants (custom styles beyond MD3)
  buttonVariants: {
    danger: {
      background: STATUS.error.main,
      text: '#ffffff',
    },
    success: {
      background: STATUS.success.main,
      text: '#ffffff',
    },
    warning: {
      background: STATUS.warning.main,
      text: '#ffffff',
    },
  },
} as const;

/**
 * Helper function to get current theme based on color scheme
 */
export const getTheme = (isDark: boolean): MD3Theme => {
  return isDark ? paperDarkTheme : paperLightTheme;
};

/**
 * Type exports
 */
export type PaperTheme = MD3Theme & {
  custom: typeof customTheme;
};

export type ThemeMode = 'light' | 'dark';
