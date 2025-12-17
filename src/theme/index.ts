/**
 * Theme Module - Central Export
 * Exports all theme-related configurations and utilities
 */

// Export core theme system
export * from './theme';
export * from './paperTheme';

// Export colors
export * from '@/constants/colors';

// Export common styles
export * from '@/constants/styles';

// Re-export main themes for convenience
export { lightTheme, darkTheme } from './theme';
export { paperLightTheme, paperDarkTheme, getTheme, customTheme } from './paperTheme';

// Type exports
export type { Theme, ThemeName, ColorKey, SpacingKey, BorderRadiusKey, ShadowKey } from './theme';
export type { PaperTheme, ThemeMode } from './paperTheme';
export type { ColorScheme, PrimaryColor, GrayColor, MedicalColorKey, StatusColorKey } from '@/constants/colors';
