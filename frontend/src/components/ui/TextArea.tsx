/**
 * TextArea Component
 * Multi-line text input with character count and auto-grow
 * Matches web app TextArea design
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';
import { SEMANTIC } from '@/constants/colors';
import { spacing, borderRadius, typography } from '@/theme/theme';

export interface TextAreaProps extends Omit<TextInputProps, 'style' | 'multiline'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerStyle?: ViewStyle;
  minHeight?: number;
  maxHeight?: number;
  autoGrow?: boolean;
  showCharCount?: boolean;
  maxLength?: number;
  rows?: number;
}

export function TextArea({
  label,
  error,
  helperText,
  required = false,
  containerStyle,
  minHeight = 100,
  maxHeight = 300,
  autoGrow = false,
  showCharCount = false,
  maxLength,
  rows = 4,
  value = '',
  onChangeText,
  ...textInputProps
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [height, setHeight] = useState(minHeight);

  const hasError = !!error;
  const charCount = value ? value.length : 0;
  const isNearLimit = maxLength && charCount >= maxLength * 0.9;
  const isAtLimit = maxLength && charCount >= maxLength;

  const handleContentSizeChange = (
    e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>
  ) => {
    if (autoGrow) {
      const newHeight = e.nativeEvent.contentSize.height;
      setHeight(Math.min(Math.max(newHeight, minHeight), maxHeight));
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label and Character Count */}
      <View style={styles.labelRow}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        {showCharCount && (
          <Text
            style={[
              styles.charCount,
              isNearLimit && styles.charCountWarning,
              isAtLimit && styles.charCountError,
            ]}
          >
            {charCount}
            {maxLength && `/${maxLength}`}
          </Text>
        )}
      </View>

      {/* TextArea Input */}
      <TextInput
        {...textInputProps}
        value={value}
        onChangeText={onChangeText}
        multiline
        numberOfLines={rows}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onContentSizeChange={handleContentSizeChange}
        maxLength={maxLength}
        style={[
          styles.textArea,
          autoGrow
            ? { height }
            : { height: minHeight },
          isFocused && styles.textAreaFocused,
          hasError && styles.textAreaError,
          textInputProps.editable === false && styles.textAreaDisabled,
        ]}
        placeholderTextColor={SEMANTIC.text.tertiary}
        textAlignVertical="top"
      />

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
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1],
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
  },
  required: {
    color: SEMANTIC.border.error,
  },
  charCount: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.tertiary,
  },
  charCountWarning: {
    color: SEMANTIC.border.error,
    fontWeight: typography.fontWeight.medium,
  },
  charCountError: {
    color: SEMANTIC.border.error,
    fontWeight: typography.fontWeight.bold,
  },
  textArea: {
    backgroundColor: SEMANTIC.surface.default,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  textAreaFocused: {
    borderColor: SEMANTIC.border.focus,
    borderWidth: 2,
  },
  textAreaError: {
    borderColor: SEMANTIC.border.error,
  },
  textAreaDisabled: {
    backgroundColor: SEMANTIC.background.tertiary,
    borderColor: SEMANTIC.border.light,
    color: SEMANTIC.text.disabled,
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
