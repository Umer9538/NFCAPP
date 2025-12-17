/**
 * MedGuard Theme Configuration
 * Design system matching web app
 */

import { Platform } from 'react-native';
import { COLORS, SEMANTIC, DARK, PRIMARY, GRAY } from '@/constants/colors';

/**
 * Typography Scale
 * Based on Inter font family from web app
 */
export const typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
      default: 'System',
    }),
  },
  fontSize: {
    xs: 12,    // 0.75rem
    sm: 14,    // 0.875rem
    base: 16,  // 1rem
    lg: 18,    // 1.125rem
    xl: 20,    // 1.25rem
    '2xl': 24, // 1.5rem
    '3xl': 30, // 1.875rem
    '4xl': 36, // 2.25rem
    '5xl': 48, // 3rem
    '6xl': 60, // 3.75rem
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },
} as const;

/**
 * Spacing Scale
 * 4px base unit matching Tailwind
 */
export const spacing = {
  0: 0,
  1: 4,    // 0.25rem
  2: 8,    // 0.5rem
  3: 12,   // 0.75rem
  4: 16,   // 1rem
  5: 20,   // 1.25rem
  6: 24,   // 1.5rem
  7: 28,   // 1.75rem
  8: 32,   // 2rem
  10: 40,  // 2.5rem
  12: 48,  // 3rem
  16: 64,  // 4rem
  20: 80,  // 5rem
  24: 96,  // 6rem
} as const;

/**
 * Border Radius
 */
export const borderRadius = {
  none: 0,
  sm: 4,    // 0.25rem
  base: 6,  // 0.375rem
  md: 8,    // 0.5rem
  lg: 12,   // 0.75rem
  xl: 16,   // 1rem
  '2xl': 20, // 1.25rem
  '3xl': 24, // 1.5rem
  full: 9999,
} as const;

/**
 * Shadows
 * Matching web app shadow system
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

/**
 * Animation Durations
 */
export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 500,
  },
  easing: {
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
    linear: 'linear' as const,
  },
} as const;

/**
 * Breakpoints
 * Responsive design breakpoints
 */
export const breakpoints = {
  xs: 0,
  sm: 375,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/**
 * Z-Index Scale
 */
export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  notification: 1700,
} as const;

/**
 * Icon Sizes
 */
export const iconSizes = {
  xs: 12,
  sm: 16,
  base: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
} as const;

/**
 * Border Widths
 */
export const borderWidth = {
  none: 0,
  hairline: 1,
  thin: 1,
  base: 1.5,
  thick: 2,
  heavy: 3,
} as const;

/**
 * Opacity Scale
 */
export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;

/**
 * Light Theme
 */
export const lightTheme = {
  name: 'light' as const,
  colors: {
    primary: PRIMARY[600],
    primaryLight: PRIMARY[500],
    primaryDark: PRIMARY[700],

    background: SEMANTIC.background.default,
    backgroundSecondary: SEMANTIC.background.secondary,
    backgroundTertiary: SEMANTIC.background.tertiary,

    surface: SEMANTIC.surface.default,
    surfaceElevated: SEMANTIC.surface.elevated,

    text: SEMANTIC.text.primary,
    textSecondary: SEMANTIC.text.secondary,
    textTertiary: SEMANTIC.text.tertiary,
    textDisabled: SEMANTIC.text.disabled,
    textInverse: SEMANTIC.text.inverse,

    border: SEMANTIC.border.default,
    borderLight: SEMANTIC.border.light,
    borderMedium: SEMANTIC.border.medium,

    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    info: COLORS.info,

    overlay: SEMANTIC.background.overlay,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  iconSizes,
  borderWidth,
  opacity,
} as const;

/**
 * Dark Theme
 */
export const darkTheme = {
  name: 'dark' as const,
  colors: {
    primary: PRIMARY[500],
    primaryLight: PRIMARY[400],
    primaryDark: PRIMARY[600],

    background: DARK.background.default,
    backgroundSecondary: DARK.background.secondary,
    backgroundTertiary: DARK.background.tertiary,

    surface: DARK.surface.default,
    surfaceElevated: DARK.surface.elevated,

    text: DARK.text.primary,
    textSecondary: DARK.text.secondary,
    textTertiary: DARK.text.tertiary,
    textDisabled: DARK.text.disabled,
    textInverse: DARK.text.inverse,

    border: DARK.border.default,
    borderLight: DARK.border.light,
    borderMedium: DARK.border.medium,

    success: COLORS.success,
    warning: COLORS.warning,
    error: COLORS.error,
    info: COLORS.info,

    overlay: DARK.background.overlay,
  },
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  breakpoints,
  zIndex,
  iconSizes,
  borderWidth,
  opacity,
} as const;

/**
 * Component Sizes
 */
export const componentSizes = {
  button: {
    xs: { height: 28, paddingHorizontal: spacing[3], fontSize: typography.fontSize.xs },
    sm: { height: 36, paddingHorizontal: spacing[4], fontSize: typography.fontSize.sm },
    md: { height: 44, paddingHorizontal: spacing[5], fontSize: typography.fontSize.base },
    lg: { height: 52, paddingHorizontal: spacing[6], fontSize: typography.fontSize.lg },
    xl: { height: 60, paddingHorizontal: spacing[8], fontSize: typography.fontSize.xl },
  },
  input: {
    sm: { height: 36, paddingHorizontal: spacing[3], fontSize: typography.fontSize.sm },
    md: { height: 44, paddingHorizontal: spacing[4], fontSize: typography.fontSize.base },
    lg: { height: 52, paddingHorizontal: spacing[5], fontSize: typography.fontSize.lg },
  },
  card: {
    padding: spacing[4],
    borderRadius: borderRadius.lg,
  },
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 96,
  },
} as const;

export type Theme = typeof lightTheme;
export type ThemeName = 'light' | 'dark';
export type ColorKey = keyof Theme['colors'];
export type SpacingKey = keyof typeof spacing;
export type BorderRadiusKey = keyof typeof borderRadius;
export type ShadowKey = keyof typeof shadows;
