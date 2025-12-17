/**
 * Button Component
 * Matches web app Button component design exactly
 */

import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { PRIMARY, GRAY, STATUS, SEMANTIC } from '@/constants/colors';
import { spacing, borderRadius, shadows, typography } from '@/theme/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Get variant styles
  const variantStyle = getVariantStyle(variant);
  const variantTextStyle = getVariantTextStyle(variant);

  // Get size styles
  const sizeStyle = getSizeStyle(size);
  const sizeTextStyle = getSizeTextStyle(size);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyle.default,
        sizeStyle,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        isDisabled && variantStyle.disabled,
        pressed && !isDisabled && variantStyle.pressed,
        style,
      ]}
      android_ripple={{
        color: getRippleColor(variant),
        borderless: false,
      }}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size={size === 'sm' ? 'small' : 'small'}
            color={getSpinnerColor(variant)}
            style={styles.spinner}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <View style={[styles.icon, styles.iconLeft]}>{icon}</View>
            )}
            <Text
              style={[
                styles.text,
                variantTextStyle,
                sizeTextStyle,
                isDisabled && styles.disabledText,
                textStyle,
              ]}
            >
              {children}
            </Text>
            {icon && iconPosition === 'right' && (
              <View style={[styles.icon, styles.iconRight]}>{icon}</View>
            )}
          </>
        )}
      </View>
    </Pressable>
  );
}

/**
 * Get variant styles
 */
function getVariantStyle(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        default: {
          backgroundColor: PRIMARY[600],
          ...shadows.sm,
        },
        pressed: {
          backgroundColor: PRIMARY[700],
          ...shadows.md,
        },
        disabled: {
          backgroundColor: SEMANTIC.interactive.disabled,
          shadowOpacity: 0,
          elevation: 0,
        },
      };

    case 'secondary':
      return {
        default: {
          backgroundColor: SEMANTIC.interactive.secondary,
          borderWidth: 1,
          borderColor: SEMANTIC.border.default,
        },
        pressed: {
          backgroundColor: SEMANTIC.interactive.secondaryHover,
          borderColor: SEMANTIC.border.medium,
        },
        disabled: {
          backgroundColor: SEMANTIC.interactive.disabled,
          borderColor: SEMANTIC.border.light,
        },
      };

    case 'outline':
      return {
        default: {
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: PRIMARY[600],
        },
        pressed: {
          backgroundColor: PRIMARY[50],
          borderColor: PRIMARY[700],
        },
        disabled: {
          backgroundColor: 'transparent',
          borderColor: SEMANTIC.border.light,
        },
      };

    case 'ghost':
      return {
        default: {
          backgroundColor: 'transparent',
        },
        pressed: {
          backgroundColor: GRAY[100],
        },
        disabled: {
          backgroundColor: 'transparent',
        },
      };

    case 'danger':
      return {
        default: {
          backgroundColor: STATUS.error.main,
          ...shadows.sm,
        },
        pressed: {
          backgroundColor: STATUS.error.dark,
          ...shadows.md,
        },
        disabled: {
          backgroundColor: SEMANTIC.interactive.disabled,
          shadowOpacity: 0,
          elevation: 0,
        },
      };

    default:
      return {
        default: {},
        pressed: {},
        disabled: {},
      };
  }
}

/**
 * Get variant text styles
 */
function getVariantTextStyle(variant: ButtonVariant): TextStyle {
  switch (variant) {
    case 'primary':
    case 'danger':
      return { color: '#ffffff' };

    case 'secondary':
      return { color: SEMANTIC.text.primary };

    case 'outline':
    case 'ghost':
      return { color: PRIMARY[600] };

    default:
      return {};
  }
}

/**
 * Get size styles
 */
function getSizeStyle(size: ButtonSize): ViewStyle {
  switch (size) {
    case 'sm':
      return {
        height: 36,
        paddingHorizontal: spacing[3],
      };

    case 'md':
      return {
        height: 44,
        paddingHorizontal: spacing[5],
      };

    case 'lg':
      return {
        height: 52,
        paddingHorizontal: spacing[6],
      };

    default:
      return {};
  }
}

/**
 * Get size text styles
 */
function getSizeTextStyle(size: ButtonSize): TextStyle {
  switch (size) {
    case 'sm':
      return {
        fontSize: typography.fontSize.sm,
      };

    case 'md':
      return {
        fontSize: typography.fontSize.base,
      };

    case 'lg':
      return {
        fontSize: typography.fontSize.lg,
      };

    default:
      return {};
  }
}

/**
 * Get ripple color for Android
 */
function getRippleColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
    case 'danger':
      return 'rgba(255, 255, 255, 0.3)';

    case 'secondary':
    case 'outline':
    case 'ghost':
      return 'rgba(0, 0, 0, 0.1)';

    default:
      return 'rgba(0, 0, 0, 0.1)';
  }
}

/**
 * Get spinner color
 */
function getSpinnerColor(variant: ButtonVariant): string {
  switch (variant) {
    case 'primary':
    case 'danger':
      return '#ffffff';

    case 'secondary':
      return SEMANTIC.text.primary;

    case 'outline':
    case 'ghost':
      return PRIMARY[600];

    default:
      return SEMANTIC.text.primary;
  }
}

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
  icon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: spacing[2],
  },
  iconRight: {
    marginLeft: spacing[2],
  },
  spinner: {
    marginHorizontal: spacing[2],
  },
  disabled: {
    opacity: 0.6,
  },
  disabledText: {
    color: SEMANTIC.interactive.disabledText,
  },
  fullWidth: {
    width: '100%',
  },
});
