/**
 * Animated Input Component
 * Text input with floating label, error shake, and success animations
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { timing, spring, errorAnimation as shakeAnimation } from '@/utils/animations';
import { haptics } from '@/utils/haptics';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export interface AnimatedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  hapticFeedback?: boolean;
  floatingLabel?: boolean;
  showSuccessCheck?: boolean;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  error,
  success = false,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  value,
  onFocus,
  onBlur,
  containerStyle,
  hapticFeedback = true,
  floatingLabel = true,
  showSuccessCheck = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = !!value;

  // Animations
  const labelY = useSharedValue(0);
  const labelScale = useSharedValue(1);
  const borderColor = useSharedValue(0);
  const shakeX = useSharedValue(0);
  const successScale = useSharedValue(0);

  // Trigger error shake
  useEffect(() => {
    if (error) {
      shakeX.value = shakeAnimation();
      if (hapticFeedback) {
        haptics.inputError();
      }
    }
  }, [error, hapticFeedback]);

  // Trigger success animation
  useEffect(() => {
    if (success && showSuccessCheck) {
      successScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, spring.bouncy)
      );
    } else {
      successScale.value = withTiming(0, timing.fast);
    }
  }, [success, showSuccessCheck]);

  // Label animation
  useEffect(() => {
    const shouldFloat = isFocused || hasValue;

    if (floatingLabel) {
      if (shouldFloat) {
        labelY.value = withSpring(-24, spring.gentle);
        labelScale.value = withSpring(0.85, spring.gentle);
      } else {
        labelY.value = withSpring(0, spring.gentle);
        labelScale.value = withSpring(1, spring.gentle);
      }
    }
  }, [isFocused, hasValue, floatingLabel]);

  // Border color animation
  useEffect(() => {
    if (error) {
      borderColor.value = withTiming(2, timing.fast); // Error
    } else if (success) {
      borderColor.value = withTiming(1, timing.fast); // Success
    } else if (isFocused) {
      borderColor.value = withTiming(3, timing.fast); // Focused
    } else {
      borderColor.value = withTiming(0, timing.fast); // Default
    }
  }, [error, success, isFocused]);

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      if (hapticFeedback) {
        haptics.inputFocus();
      }
      onFocus?.(e);
    },
    [hapticFeedback, onFocus]
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    },
    [onBlur]
  );

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: labelY.value },
      { scale: labelScale.value },
    ],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const borderStyle = useAnimatedStyle(() => {
    const colors = [
      COLORS.gray[300], // Default
      COLORS.success[500], // Success
      COLORS.error[500], // Error
      COLORS.primary[500], // Focused
    ];

    return {
      borderColor: colors[borderColor.value] || colors[0],
    };
  });

  const successIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const getLabelColor = () => {
    if (error) return COLORS.error[500];
    if (success) return COLORS.success[500];
    if (isFocused) return COLORS.primary[500];
    return COLORS.gray[600];
  };

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle, containerStyle]}>
      {/* Floating Label */}
      {label && (
        <Animated.Text
          style={[
            styles.label,
            {
              color: getLabelColor(),
            },
            labelStyle,
          ]}
        >
          {label}
        </Animated.Text>
      )}

      {/* Input Container */}
      <Animated.View style={[styles.inputContainer, borderStyle]}>
        {/* Left Icon */}
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? COLORS.primary[500] : COLORS.gray[400]}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <AnimatedTextInput
          {...props}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || (success && showSuccessCheck)) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={COLORS.gray[400]}
        />

        {/* Success Checkmark */}
        {success && showSuccessCheck && !rightIcon && (
          <Animated.View style={[styles.successIcon, successIconStyle]}>
            <Ionicons name="checkmark-circle" size={20} color={COLORS.success[500]} />
          </Animated.View>
        )}

        {/* Right Icon */}
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={isFocused ? COLORS.primary[500] : COLORS.gray[400]}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </Animated.View>

      {/* Error or Helper Text */}
      {(error || helperText) && (
        <View style={styles.helperContainer}>
          {error ? (
            <>
              <Ionicons
                name="alert-circle"
                size={14}
                color={COLORS.error[500]}
                style={styles.helperIcon}
              />
              <Text style={styles.errorText}>{error}</Text>
            </>
          ) : (
            <Text style={styles.helperText}>{helperText}</Text>
          )}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    marginBottom: SPACING.xs,
    position: 'absolute',
    top: 16,
    left: SPACING.md,
    zIndex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body,
    color: COLORS.gray[900],
  },
  inputWithLeftIcon: {
    paddingLeft: SPACING.xs,
  },
  inputWithRightIcon: {
    paddingRight: SPACING.xs,
  },
  leftIcon: {
    marginLeft: SPACING.md,
  },
  rightIcon: {
    marginRight: SPACING.md,
  },
  successIcon: {
    marginRight: SPACING.md,
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  helperIcon: {
    marginRight: 4,
  },
  errorText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.error[500],
    flex: 1,
  },
  helperText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.gray[600],
    flex: 1,
  },
});
