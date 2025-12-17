/**
 * Badge Component
 * Status badges with color variants
 * Matches web app Badge component design exactly
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { PRIMARY, STATUS, SEMANTIC, MEDICAL_COLORS } from '@/constants/colors';
import { spacing, borderRadius, typography } from '@/theme/theme';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'medical'
  | 'allergy'
  | 'medication';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  style,
  textStyle,
  dot = false,
}: BadgeProps) {
  const variantStyle = getVariantStyle(variant);
  const sizeStyle = getSizeStyle(size);
  const textSizeStyle = getTextSizeStyle(size);

  return (
    <View
      style={[styles.badge, variantStyle.container, sizeStyle.container, style]}
    >
      {dot && <View style={[styles.dot, variantStyle.dot]} />}
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, variantStyle.text, textSizeStyle, textStyle]}>
        {children}
      </Text>
    </View>
  );
}

/**
 * Get variant styles
 */
function getVariantStyle(variant: BadgeVariant) {
  switch (variant) {
    case 'default':
      return {
        container: {
          backgroundColor: SEMANTIC.background.tertiary,
        },
        text: {
          color: SEMANTIC.text.primary,
        },
        dot: {
          backgroundColor: SEMANTIC.text.primary,
        },
      };

    case 'primary':
      return {
        container: {
          backgroundColor: PRIMARY[100],
        },
        text: {
          color: PRIMARY[700],
        },
        dot: {
          backgroundColor: PRIMARY[600],
        },
      };

    case 'success':
      return {
        container: {
          backgroundColor: STATUS.success.light,
        },
        text: {
          color: STATUS.success.text,
        },
        dot: {
          backgroundColor: STATUS.success.main,
        },
      };

    case 'warning':
      return {
        container: {
          backgroundColor: STATUS.warning.light,
        },
        text: {
          color: STATUS.warning.text,
        },
        dot: {
          backgroundColor: STATUS.warning.main,
        },
      };

    case 'error':
      return {
        container: {
          backgroundColor: STATUS.error.light,
        },
        text: {
          color: STATUS.error.text,
        },
        dot: {
          backgroundColor: STATUS.error.main,
        },
      };

    case 'info':
      return {
        container: {
          backgroundColor: STATUS.info.light,
        },
        text: {
          color: STATUS.info.text,
        },
        dot: {
          backgroundColor: STATUS.info.main,
        },
      };

    case 'medical':
      return {
        container: {
          backgroundColor: MEDICAL_COLORS.red.light,
        },
        text: {
          color: MEDICAL_COLORS.red.text,
        },
        dot: {
          backgroundColor: MEDICAL_COLORS.red.main,
        },
      };

    case 'allergy':
      return {
        container: {
          backgroundColor: MEDICAL_COLORS.yellow.light,
        },
        text: {
          color: MEDICAL_COLORS.yellow.text,
        },
        dot: {
          backgroundColor: MEDICAL_COLORS.yellow.main,
        },
      };

    case 'medication':
      return {
        container: {
          backgroundColor: MEDICAL_COLORS.blue.light,
        },
        text: {
          color: MEDICAL_COLORS.blue.text,
        },
        dot: {
          backgroundColor: MEDICAL_COLORS.blue.main,
        },
      };

    default:
      return {
        container: {
          backgroundColor: SEMANTIC.background.tertiary,
        },
        text: {
          color: SEMANTIC.text.primary,
        },
        dot: {
          backgroundColor: SEMANTIC.text.primary,
        },
      };
  }
}

/**
 * Get size styles
 */
function getSizeStyle(size: BadgeSize) {
  switch (size) {
    case 'sm':
      return {
        container: {
          paddingHorizontal: spacing[2],
          paddingVertical: spacing[0] + 2,
        },
      };

    case 'md':
      return {
        container: {
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1],
        },
      };

    case 'lg':
      return {
        container: {
          paddingHorizontal: spacing[4],
          paddingVertical: spacing[2],
        },
      };

    default:
      return {
        container: {
          paddingHorizontal: spacing[3],
          paddingVertical: spacing[1],
        },
      };
  }
}

/**
 * Get text size styles
 */
function getTextSizeStyle(size: BadgeSize): TextStyle {
  switch (size) {
    case 'sm':
      return {
        fontSize: typography.fontSize.xs,
      };

    case 'md':
      return {
        fontSize: typography.fontSize.sm,
      };

    case 'lg':
      return {
        fontSize: typography.fontSize.base,
      };

    default:
      return {
        fontSize: typography.fontSize.sm,
      };
  }
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: borderRadius.full,
  },
  text: {
    fontWeight: typography.fontWeight.medium,
  },
  icon: {
    marginRight: spacing[1],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing[1],
  },
});
