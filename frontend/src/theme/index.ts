/**
 * Theme Module - Central Export
 * Exports all theme-related configurations and utilities
 */

// Export core theme system
export * from './theme';
export * from './paperTheme';

// Export dynamic theme system (account-type based colors)
export {
  ThemeProvider,
  useTheme,
  useThemeColors,
  usePrimaryColor,
  useSemanticColors,
  useAccountInfo,
  withTheme,
  ThemeContext,
} from './ThemeProvider';

export {
  baseColors,
  accountThemes,
  getTheme as getDynamicTheme,
  getPrimaryColors,
  getGradientColors,
  defaultTheme,
} from './colors';

export type {
  Theme as DynamicTheme,
  PrimaryPalette,
} from './colors';

// Export colors
export * from '@/constants/colors';

// Export common styles
export * from '@/constants/styles';
