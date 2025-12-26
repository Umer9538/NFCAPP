/**
 * Animated Button Component
 * Button with press animations and haptic feedback
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  type PressableProps,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { spring, timing } from '@/utils/animations';
import { haptics } from '@/utils/haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface AnimatedButtonProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  scaleOnPress?: boolean;
  animationType?: 'scale' | 'opacity' | 'both';
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  hapticFeedback = true,
  scaleOnPress = true,
  animationType = 'both',
  onPress,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (scaleOnPress && animationType !== 'opacity') {
      scale.value = withSpring(0.95, spring.gentle);
    }
    if (animationType !== 'scale') {
      opacity.value = withTiming(0.7, timing.fast);
    }
  }, [scaleOnPress, animationType]);

  const handlePressOut = useCallback(() => {
    if (scaleOnPress && animationType !== 'opacity') {
      scale.value = withSpring(1, spring.gentle);
    }
    if (animationType !== 'scale') {
      opacity.value = withTiming(1, timing.fast);
    }
  }, [scaleOnPress, animationType]);

  const handlePress = useCallback(
    (event: any) => {
      if (disabled || loading) return;

      if (hapticFeedback) {
        haptics.buttonPress(variant);
      }

      onPress?.(event);
    },
    [disabled, loading, hapticFeedback, variant, onPress]
  );

  const animatedStyle = useAnimatedStyle(() => {
    const styles: any = {};

    if (animationType !== 'opacity') {
      styles.transform = [{ scale: scale.value }];
    }

    if (animationType !== 'scale') {
      styles.opacity = opacity.value;
    }

    return styles;
  });

  const getBackgroundColor = () => {
    if (disabled) return COLORS.gray[300];

    switch (variant) {
      case 'primary':
        return COLORS.primary[600];
      case 'secondary':
        return COLORS.secondary[600];
      case 'outline':
        return 'transparent';
      case 'ghost':
        return 'transparent';
      case 'danger':
        return COLORS.error[600];
      default:
        return COLORS.primary[600];
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.gray[500];

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#fff';
      case 'outline':
        return COLORS.primary[600];
      case 'ghost':
        return COLORS.gray[700];
      default:
        return '#fff';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm };
      case 'md':
        return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
      case 'lg':
        return { paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg };
      default:
        return { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md };
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1,
        borderColor: disabled ? COLORS.gray[300] : COLORS.primary[600],
      };
    }
    return {};
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          ...getPadding(),
          ...getBorderStyle(),
        },
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Animated.View style={styles.iconLeft}>{icon}</Animated.View>
          )}

          {typeof children === 'string' ? (
            <Text
              style={[
                styles.text,
                { color: getTextColor() },
                size === 'sm' && styles.textSm,
                size === 'lg' && styles.textLg,
                textStyle,
              ]}
            >
              {children}
            </Text>
          ) : (
            children
          )}

          {icon && iconPosition === 'right' && (
            <Animated.View style={styles.iconRight}>{icon}</Animated.View>
          )}
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...TYPOGRAPHY.button,
    color: '#fff',
    fontWeight: '600',
  },
  textSm: {
    fontSize: 14,
  },
  textLg: {
    fontSize: 18,
  },
  iconLeft: {
    marginRight: SPACING.xs,
  },
  iconRight: {
    marginLeft: SPACING.xs,
  },
});
