/**
 * Card Component
 * Container card with variants and elevation
 * Matches web app Card component design
 */

import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { SEMANTIC, PRIMARY } from '@/constants/colors';
import { spacing, borderRadius, shadows } from '@/theme/theme';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'medical';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  style?: ViewStyle;
  pressable?: boolean;
  borderLeftColor?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  pressable = false,
  borderLeftColor,
}: CardProps) {
  const variantStyle = getVariantStyle(variant);
  const paddingStyle = getPaddingStyle(padding);

  const cardStyle = [
    styles.card,
    variantStyle,
    paddingStyle,
    borderLeftColor && { borderLeftWidth: 4, borderLeftColor },
    style,
  ];

  if (pressable || onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
          pressed && variantStyle === styles.outlined && styles.pressedOutlined,
        ]}
        android_ripple={{
          color: 'rgba(0, 0, 0, 0.05)',
          borderless: false,
        }}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

/**
 * Get variant styles
 */
function getVariantStyle(variant: CardVariant): ViewStyle {
  switch (variant) {
    case 'default':
      return {
        backgroundColor: SEMANTIC.surface.default,
        ...shadows.sm,
      };

    case 'elevated':
      return {
        backgroundColor: SEMANTIC.surface.default,
        ...shadows.md,
      };

    case 'outlined':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: SEMANTIC.border.default,
      };

    case 'medical':
      return {
        backgroundColor: SEMANTIC.surface.default,
        borderLeftWidth: 4,
        borderLeftColor: PRIMARY[600],
        ...shadows.sm,
      };

    default:
      return {
        backgroundColor: SEMANTIC.surface.default,
        ...shadows.sm,
      };
  }
}

/**
 * Get padding styles
 */
function getPaddingStyle(padding: CardPadding): ViewStyle {
  switch (padding) {
    case 'none':
      return {
        padding: 0,
      };

    case 'sm':
      return {
        padding: spacing[3],
      };

    case 'md':
      return {
        padding: spacing[4],
      };

    case 'lg':
      return {
        padding: spacing[6],
      };

    default:
      return {
        padding: spacing[4],
      };
  }
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
  },
  pressed: {
    backgroundColor: SEMANTIC.background.secondary,
  },
  pressedOutlined: {
    borderColor: SEMANTIC.border.medium,
  },
});

/**
 * Card Header Component
 */
interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

/**
 * Card Content Component
 */
interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

/**
 * Card Footer Component
 */
interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const componentStyles = StyleSheet.create({
  header: {
    marginBottom: spacing[3],
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
    paddingTop: spacing[3],
  },
});

// Merge component styles with main styles
Object.assign(styles, componentStyles);
