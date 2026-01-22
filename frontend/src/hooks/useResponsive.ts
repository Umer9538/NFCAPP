/**
 * useResponsive Hook
 * Provides reactive responsive values that update on dimension changes
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dimensions, ScaledSize, useWindowDimensions } from 'react-native';
import {
  BREAKPOINTS,
  Breakpoint,
  getBreakpoint,
  isTablet,
  isSmallDevice,
  wp,
  hp,
  sp,
  fontSize,
  responsive,
  getContainerPadding,
  getMaxContentWidth,
  getGridColumns,
  getSafeAreaInsets,
  responsiveSpacing,
} from '@/utils/responsive';

// Base dimensions for scaling
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;

interface ResponsiveValues {
  // Screen dimensions
  width: number;
  height: number;
  isPortrait: boolean;
  isLandscape: boolean;

  // Breakpoint info
  breakpoint: Breakpoint;
  isTablet: boolean;
  isSmallDevice: boolean;

  // Scale factors
  widthScale: number;
  heightScale: number;
  scale: number;

  // Scaling functions
  wp: (value: number) => number;
  hp: (value: number) => number;
  sp: (value: number) => number;
  fontSize: (size: number) => number;
  responsiveSpacing: (value: number) => number;

  // Responsive utilities
  responsive: <T>(values: {
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    xxl?: T;
    default: T;
  }) => T;

  // Layout helpers
  containerPadding: number;
  maxContentWidth: number | undefined;
  gridColumns: number;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Hook for responsive design with reactive updates
 */
export function useResponsive(): ResponsiveValues {
  const { width, height } = useWindowDimensions();

  // Compute scale factors
  const widthScale = width / BASE_WIDTH;
  const heightScale = height / BASE_HEIGHT;
  const scale = Math.min(widthScale, heightScale);

  // Determine breakpoint
  const getBreakpointFromWidth = useCallback((w: number): Breakpoint => {
    if (w >= BREAKPOINTS.xxl) return 'xxl';
    if (w >= BREAKPOINTS.xl) return 'xl';
    if (w >= BREAKPOINTS.lg) return 'lg';
    if (w >= BREAKPOINTS.md) return 'md';
    if (w >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  }, []);

  const breakpoint = getBreakpointFromWidth(width);
  const isTabletDevice = width >= BREAKPOINTS.lg;
  const isSmall = width < BREAKPOINTS.sm;

  // Scaling functions using current dimensions
  const wpFn = useCallback(
    (value: number) => Math.round(value * widthScale),
    [widthScale]
  );

  const hpFn = useCallback(
    (value: number) => Math.round(value * heightScale),
    [heightScale]
  );

  const spFn = useCallback(
    (value: number) => Math.round(value * scale),
    [scale]
  );

  const fontSizeFn = useCallback(
    (size: number) => {
      const scaledSize = size * scale;
      const minScale = 0.85;
      const maxScale = 1.3;
      const constrainedSize = Math.max(
        size * minScale,
        Math.min(scaledSize, size * maxScale)
      );
      return Math.round(constrainedSize);
    },
    [scale]
  );

  const responsiveSpacingFn = useCallback(
    (baseValue: number) => {
      if (isSmall) return Math.round(baseValue * 0.85);
      if (isTabletDevice) return Math.round(baseValue * 1.25);
      return baseValue;
    },
    [isSmall, isTabletDevice]
  );

  // Responsive value selector
  const responsiveFn = useCallback(
    <T,>(values: {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      xxl?: T;
      default: T;
    }): T => {
      if (breakpoint === 'xxl' && values.xxl !== undefined) return values.xxl;
      if (breakpoint === 'xl' && values.xl !== undefined) return values.xl;
      if (breakpoint === 'lg' && values.lg !== undefined) return values.lg;
      if (breakpoint === 'md' && values.md !== undefined) return values.md;
      if (breakpoint === 'sm' && values.sm !== undefined) return values.sm;
      if (breakpoint === 'xs' && values.xs !== undefined) return values.xs;

      const breakpoints: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
      const currentIndex = breakpoints.indexOf(breakpoint);

      for (let i = currentIndex; i < breakpoints.length; i++) {
        const bp = breakpoints[i];
        if (values[bp] !== undefined) return values[bp]!;
      }

      return values.default;
    },
    [breakpoint]
  );

  // Layout helpers
  const containerPadding = useMemo(() => {
    return responsiveFn({
      xs: 12,
      sm: 16,
      md: 20,
      lg: 32,
      xl: 48,
      default: 16,
    });
  }, [responsiveFn]);

  const maxContentWidth = useMemo(() => {
    if (isTabletDevice) {
      return responsiveFn({
        lg: 600,
        xl: 720,
        xxl: 800,
        default: undefined,
      });
    }
    return undefined;
  }, [isTabletDevice, responsiveFn]);

  const gridColumns = useMemo(() => {
    return responsiveFn({
      xs: 1,
      sm: 2,
      md: 2,
      lg: 3,
      xl: 4,
      default: 2,
    });
  }, [responsiveFn]);

  const safeAreaInsets = useMemo(() => getSafeAreaInsets(), []);

  return {
    // Screen dimensions
    width,
    height,
    isPortrait: height > width,
    isLandscape: width > height,

    // Breakpoint info
    breakpoint,
    isTablet: isTabletDevice,
    isSmallDevice: isSmall,

    // Scale factors
    widthScale,
    heightScale,
    scale,

    // Scaling functions
    wp: wpFn,
    hp: hpFn,
    sp: spFn,
    fontSize: fontSizeFn,
    responsiveSpacing: responsiveSpacingFn,

    // Responsive utilities
    responsive: responsiveFn,

    // Layout helpers
    containerPadding,
    maxContentWidth,
    gridColumns,
    safeAreaInsets,
  };
}

/**
 * Simple hook for screen dimensions with reactive updates
 */
export function useScreenDimensions() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isPortrait: height > width,
    isLandscape: width > height,
  };
}

/**
 * Hook for breakpoint detection
 */
export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();

  if (width >= BREAKPOINTS.xxl) return 'xxl';
  if (width >= BREAKPOINTS.xl) return 'xl';
  if (width >= BREAKPOINTS.lg) return 'lg';
  if (width >= BREAKPOINTS.md) return 'md';
  if (width >= BREAKPOINTS.sm) return 'sm';
  return 'xs';
}

/**
 * Hook for tablet detection
 */
export function useIsTablet(): boolean {
  const { width } = useWindowDimensions();
  return width >= BREAKPOINTS.lg;
}

export default useResponsive;
