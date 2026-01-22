/**
 * ResponsiveContainer Component
 * Provides consistent responsive padding and max-width constraints
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';
import { SEMANTIC } from '@/constants/colors';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  scrollViewProps?: ScrollViewProps;
  padded?: boolean;
  safeArea?: boolean | 'top' | 'bottom' | 'horizontal';
  maxWidth?: number | 'auto';
  centered?: boolean;
  backgroundColor?: string;
}

export function ResponsiveContainer({
  children,
  style,
  scrollable = false,
  scrollViewProps,
  padded = true,
  safeArea = false,
  maxWidth = 'auto',
  centered = true,
  backgroundColor = SEMANTIC.background.default,
}: ResponsiveContainerProps) {
  const insets = useSafeAreaInsets();
  const { containerPadding, maxContentWidth, isTablet } = useResponsive();

  // Calculate safe area padding
  const safeAreaStyle: ViewStyle = {};
  if (safeArea === true) {
    safeAreaStyle.paddingTop = insets.top;
    safeAreaStyle.paddingBottom = insets.bottom;
    safeAreaStyle.paddingLeft = insets.left;
    safeAreaStyle.paddingRight = insets.right;
  } else if (safeArea === 'top') {
    safeAreaStyle.paddingTop = insets.top;
  } else if (safeArea === 'bottom') {
    safeAreaStyle.paddingBottom = insets.bottom;
  } else if (safeArea === 'horizontal') {
    safeAreaStyle.paddingLeft = insets.left;
    safeAreaStyle.paddingRight = insets.right;
  }

  // Calculate max width
  const computedMaxWidth = maxWidth === 'auto' ? maxContentWidth : maxWidth;

  // Container style
  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor,
    ...safeAreaStyle,
  };

  // Content style with padding and max width
  const contentStyle: ViewStyle = {
    flex: 1,
    ...(padded && { paddingHorizontal: containerPadding }),
    ...(computedMaxWidth && centered && {
      maxWidth: computedMaxWidth,
      alignSelf: 'center',
      width: '100%',
    }),
  };

  // Inner content wrapper
  const ContentWrapper = ({ children: innerChildren }: { children: React.ReactNode }) => (
    <View style={[contentStyle, style]}>{innerChildren}</View>
  );

  if (scrollable) {
    return (
      <View style={containerStyle}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            padded && { paddingHorizontal: containerPadding },
            computedMaxWidth && centered && {
              maxWidth: computedMaxWidth,
              alignSelf: 'center',
              width: '100%',
            },
            style,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <ContentWrapper>{children}</ContentWrapper>
    </View>
  );
}

/**
 * ResponsiveScrollView Component
 * A pre-configured scrollable container with responsive padding
 */
interface ResponsiveScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  padded?: boolean;
  safeArea?: boolean | 'top' | 'bottom';
  backgroundColor?: string;
}

export function ResponsiveScrollView({
  children,
  padded = true,
  safeArea = false,
  backgroundColor = SEMANTIC.background.default,
  contentContainerStyle,
  ...props
}: ResponsiveScrollViewProps) {
  const insets = useSafeAreaInsets();
  const { containerPadding, maxContentWidth } = useResponsive();

  const safeAreaPadding: ViewStyle = {};
  if (safeArea === true) {
    safeAreaPadding.paddingTop = insets.top;
    safeAreaPadding.paddingBottom = insets.bottom;
  } else if (safeArea === 'top') {
    safeAreaPadding.paddingTop = insets.top;
  } else if (safeArea === 'bottom') {
    safeAreaPadding.paddingBottom = insets.bottom;
  }

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor }]}
      contentContainerStyle={[
        styles.scrollContent,
        padded && { paddingHorizontal: containerPadding },
        safeAreaPadding,
        maxContentWidth && {
          maxWidth: maxContentWidth,
          alignSelf: 'center',
          width: '100%',
        },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  );
}

/**
 * ResponsiveRow Component
 * A row that can wrap on smaller screens
 */
interface ResponsiveRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gap?: number;
  wrapOnSmall?: boolean;
}

export function ResponsiveRow({
  children,
  style,
  gap = 16,
  wrapOnSmall = true,
}: ResponsiveRowProps) {
  const { isSmallDevice } = useResponsive();

  return (
    <View
      style={[
        styles.row,
        { gap },
        wrapOnSmall && isSmallDevice && styles.rowWrap,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * ResponsiveGrid Component
 * A grid that adjusts columns based on screen size
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gap?: number;
  minItemWidth?: number;
}

export function ResponsiveGrid({
  children,
  style,
  gap = 16,
  minItemWidth = 150,
}: ResponsiveGridProps) {
  const { width, gridColumns } = useResponsive();

  const itemWidth = (width - gap * (gridColumns + 1)) / gridColumns;
  const adjustedItemWidth = Math.max(itemWidth, minItemWidth);

  return (
    <View style={[styles.grid, { gap }, style]}>
      {React.Children.map(children, (child) => (
        <View style={{ width: adjustedItemWidth }}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowWrap: {
    flexWrap: 'wrap',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
});

export default ResponsiveContainer;
