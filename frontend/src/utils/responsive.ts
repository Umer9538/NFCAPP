/**
 * Responsive Utilities
 * Provides scaling and responsive design helpers for all screen sizes
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

// Base dimensions (iPhone 14 Pro as reference)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

// Get screen dimensions
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Scale factors
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;
const scale = Math.min(widthScale, heightScale);

/**
 * Breakpoint definitions
 */
export const BREAKPOINTS = {
  xs: 0,      // Extra small phones
  sm: 375,    // Small phones (iPhone SE, etc.)
  md: 414,    // Medium phones (iPhone Plus, Pro Max)
  lg: 768,    // Tablets
  xl: 1024,   // Large tablets / Small laptops
  xxl: 1280,  // Desktop
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Get current breakpoint based on screen width
 */
export function getBreakpoint(): Breakpoint {
  if (SCREEN_WIDTH >= BREAKPOINTS.xxl) return 'xxl';
  if (SCREEN_WIDTH >= BREAKPOINTS.xl) return 'xl';
  if (SCREEN_WIDTH >= BREAKPOINTS.lg) return 'lg';
  if (SCREEN_WIDTH >= BREAKPOINTS.md) return 'md';
  if (SCREEN_WIDTH >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Check if screen is at least a certain breakpoint
 */
export function isBreakpoint(breakpoint: Breakpoint): boolean {
  return SCREEN_WIDTH >= BREAKPOINTS[breakpoint];
}

/**
 * Check if device is a tablet
 */
export function isTablet(): boolean {
  return SCREEN_WIDTH >= BREAKPOINTS.lg;
}

/**
 * Check if device is a small phone
 */
export function isSmallDevice(): boolean {
  return SCREEN_WIDTH < BREAKPOINTS.sm;
}

/**
 * Scale a value based on screen width
 * Use for horizontal measurements (width, horizontal padding/margin)
 */
export function wp(value: number): number {
  return Math.round(value * widthScale);
}

/**
 * Scale a value based on screen height
 * Use for vertical measurements (height, vertical padding/margin)
 */
export function hp(value: number): number {
  return Math.round(value * heightScale);
}

/**
 * Scale a value proportionally (uses minimum of width/height scale)
 * Use for elements that should maintain aspect ratio (icons, avatars)
 */
export function sp(value: number): number {
  return Math.round(value * scale);
}

/**
 * Scale font size with constraints
 * Ensures text is readable on all devices while scaling appropriately
 */
export function fontSize(size: number): number {
  const scaledSize = size * scale;

  // Apply constraints to prevent text from being too small or too large
  const minScale = 0.85;  // Don't go below 85% of original size
  const maxScale = 1.3;   // Don't go above 130% of original size

  const constrainedSize = Math.max(
    size * minScale,
    Math.min(scaledSize, size * maxScale)
  );

  // Round to nearest pixel for crisp rendering
  return Math.round(PixelRatio.roundToNearestPixel(constrainedSize));
}

/**
 * Responsive value selector
 * Returns different values based on current breakpoint
 */
export function responsive<T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  xxl?: T;
  default: T;
}): T {
  const breakpoint = getBreakpoint();

  // Check breakpoints from largest to smallest
  if (breakpoint === 'xxl' && values.xxl !== undefined) return values.xxl;
  if (breakpoint === 'xl' && values.xl !== undefined) return values.xl;
  if (breakpoint === 'lg' && values.lg !== undefined) return values.lg;
  if (breakpoint === 'md' && values.md !== undefined) return values.md;
  if (breakpoint === 'sm' && values.sm !== undefined) return values.sm;
  if (breakpoint === 'xs' && values.xs !== undefined) return values.xs;

  // Fallback logic: use the nearest smaller breakpoint value
  const breakpoints: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpoints.indexOf(breakpoint);

  for (let i = currentIndex; i < breakpoints.length; i++) {
    const bp = breakpoints[i];
    if (values[bp] !== undefined) return values[bp]!;
  }

  return values.default;
}

/**
 * Get responsive spacing
 * Returns scaled spacing value
 */
export function responsiveSpacing(baseValue: number): number {
  if (isSmallDevice()) {
    return Math.round(baseValue * 0.85);
  }
  if (isTablet()) {
    return Math.round(baseValue * 1.25);
  }
  return baseValue;
}

/**
 * Get responsive padding for containers
 */
export function getContainerPadding(): number {
  return responsive({
    xs: 12,
    sm: 16,
    md: 20,
    lg: 32,
    xl: 48,
    default: 16,
  });
}

/**
 * Get max content width for tablets/large screens
 */
export function getMaxContentWidth(): number | undefined {
  if (isTablet()) {
    return responsive({
      lg: 600,
      xl: 720,
      xxl: 800,
      default: undefined,
    });
  }
  return undefined;
}

/**
 * Get responsive font sizes
 */
export const responsiveFontSizes = {
  xs: fontSize(12),
  sm: fontSize(14),
  base: fontSize(16),
  lg: fontSize(18),
  xl: fontSize(20),
  '2xl': fontSize(24),
  '3xl': fontSize(30),
  '4xl': fontSize(36),
  '5xl': fontSize(48),
};

/**
 * Get responsive icon sizes
 */
export const responsiveIconSizes = {
  xs: sp(12),
  sm: sp(16),
  base: sp(20),
  md: sp(24),
  lg: sp(32),
  xl: sp(40),
  '2xl': sp(48),
};

/**
 * Get screen dimensions
 */
export function getScreenDimensions() {
  return {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    isPortrait: SCREEN_HEIGHT > SCREEN_WIDTH,
    isLandscape: SCREEN_WIDTH > SCREEN_HEIGHT,
  };
}

/**
 * Calculate percentage of screen width
 */
export function widthPercentage(percentage: number): number {
  return Math.round((SCREEN_WIDTH * percentage) / 100);
}

/**
 * Calculate percentage of screen height
 */
export function heightPercentage(percentage: number): number {
  return Math.round((SCREEN_HEIGHT * percentage) / 100);
}

/**
 * Get safe area insets approximation
 * Note: For accurate values, use react-native-safe-area-context
 */
export function getSafeAreaInsets() {
  const hasNotch = Platform.OS === 'ios' && (SCREEN_HEIGHT >= 812 || SCREEN_WIDTH >= 812);
  const hasHomeIndicator = Platform.OS === 'ios' && hasNotch;
  const hasStatusBar = Platform.OS === 'android';

  return {
    top: hasNotch ? 47 : (hasStatusBar ? 24 : 20),
    bottom: hasHomeIndicator ? 34 : 0,
    left: 0,
    right: 0,
  };
}

/**
 * Responsive border radius
 */
export function responsiveBorderRadius(baseRadius: number): number {
  return sp(baseRadius);
}

/**
 * Get number of columns for grid layouts
 */
export function getGridColumns(): number {
  return responsive({
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    default: 2,
  });
}

// Export screen constants
export { SCREEN_WIDTH, SCREEN_HEIGHT, scale, widthScale, heightScale };
