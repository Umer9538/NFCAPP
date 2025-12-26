/**
 * Input Component
 * Text input with label, error states, and icons
 * Matches web app Input component design
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Pressable,
} from 'react-native';
import { SEMANTIC, PRIMARY } from '@/constants/colors';
import { spacing, borderRadius, typography } from '@/theme/theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  required = false,
  secureTextEntry,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = !!error;
  const showPasswordToggle = secureTextEntry && !rightIcon;

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          textInputProps.editable === false && styles.inputContainerDisabled,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          {...textInputProps}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={SEMANTIC.text.tertiary}
        />

        {/* Right Icon or Password Toggle */}
        {showPasswordToggle ? (
          <Pressable
            onPress={togglePasswordVisibility}
            style={styles.rightIcon}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.passwordToggle}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </Pressable>
        ) : rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon}
          </Pressable>
        ) : null}
      </View>

      {/* Helper Text or Error */}
      {hasError ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  required: {
    color: SEMANTIC.border.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SEMANTIC.surface.default,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    minHeight: 44,
  },
  inputContainerFocused: {
    borderColor: SEMANTIC.border.focus,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: SEMANTIC.border.error,
    borderWidth: 1,
  },
  inputContainerDisabled: {
    backgroundColor: SEMANTIC.background.tertiary,
    borderColor: SEMANTIC.border.light,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    paddingLeft: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIcon: {
    paddingRight: spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordToggle: {
    fontSize: 20,
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.border.error,
    marginTop: spacing[1],
  },
});
