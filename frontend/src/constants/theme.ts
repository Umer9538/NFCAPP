/**
 * Theme Constants Export
 * Re-exports commonly used theme values for easy importing
 */

import * as ColorExports from './colors';
export { PRIMARY, GRAY, SEMANTIC, STATUS, MEDICAL_COLORS } from './colors';
export { spacing, typography, borderRadius, shadows } from '../theme/theme';

// Create COLORS object that includes all color scales
export const COLORS = {
  primary: ColorExports.PRIMARY,
  secondary: ColorExports.PRIMARY, // Use primary for secondary
  gray: ColorExports.GRAY,
  success: ColorExports.STATUS.success,
  warning: ColorExports.STATUS.warning,
  error: ColorExports.STATUS.error,
  info: ColorExports.STATUS.info,
};

// Create SPACING and TYPOGRAPHY aliases for convenience
import { spacing, typography } from '../theme/theme';

export const SPACING = {
  xs: spacing[2],   // 8
  sm: spacing[3],   // 12
  md: spacing[4],   // 16
  lg: spacing[6],   // 24
  xl: spacing[8],   // 32
  '2xl': spacing[12], // 48
} as const;

export const TYPOGRAPHY = {
  h1: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight * typography.fontSize['4xl'],
  },
  h2: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight * typography.fontSize['3xl'],
  },
  h3: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug * typography.fontSize['2xl'],
  },
  h4: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.snug * typography.fontSize.xl,
  },
  body: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal * typography.fontSize.lg,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  button: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
} as const;
