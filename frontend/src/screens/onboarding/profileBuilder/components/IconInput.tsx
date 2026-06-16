import React, { useState, cloneElement, isValidElement } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

type PassThrough = Omit<
  TextInputProps,
  'value' | 'onChange' | 'onChangeText' | 'style' | 'placeholderTextColor'
>;

interface Props extends PassThrough {
  label: string;
  required?: boolean;
  optional?: boolean;
  value: string;
  onChange: (v: string) => void;
  /** ReactNode rendered as a leading icon inside the input border. */
  icon?: React.ReactNode;
  /** Red error message shown below the input. */
  error?: string;
  /** Gray helper text shown below the input. */
  helperText?: string;
}

const FOCUS_BLUE = '#2563eb';
const ERROR_RED = '#ef4444';
const ERROR_TEXT = '#dc2626';

/**
 * Text input with optional leading icon. On focus the label and icon turn
 * blue and the border turns red (matches the web's animated focus ring); on
 * error the border is red and an inline message with ⚠️ appears below.
 */
export function IconInput({
  label,
  required,
  optional,
  value,
  onChange,
  icon,
  error,
  helperText,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);

  const handleFocus = (e: any) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: any) => {
    setFocused(false);
    onBlur?.(e);
  };

  const labelColor = focused ? FOCUS_BLUE : SEMANTIC.text.primary;
  const iconColor = focused ? FOCUS_BLUE : GRAY[400];

  // Re-tint the icon node when focused by cloning with a new `color` prop.
  const renderedIcon =
    icon && isValidElement(icon)
      ? cloneElement(icon as React.ReactElement<{ color?: string }>, { color: iconColor })
      : icon;

  const borderColor = error
    ? ERROR_RED
    : focused
    ? ERROR_RED
    : SEMANTIC.border.default;

  return (
    <View>
      <Text
        style={[styles.label, { color: labelColor }]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label}
        {required && <Text style={styles.required}> *</Text>}
        {optional && <Text style={styles.optional}> (Optional)</Text>}
      </Text>
      <View style={styles.inputRow}>
        {renderedIcon && <View style={styles.icon}>{renderedIcon}</View>}
        <TextInput
          style={[
            styles.input,
            icon ? styles.inputWithIcon : null,
            { borderColor },
          ]}
          value={value}
          onChangeText={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={GRAY[400]}
          {...rest}
        />
      </View>
      {error ? (
        <Text style={styles.error}>
          <Text style={styles.errorIcon}>⚠️ </Text>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing[1],
  },
  required: { color: PRIMARY[600] },
  optional: {
    color: SEMANTIC.text.secondary,
    fontWeight: typography.fontWeight.normal,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  icon: {
    position: 'absolute',
    left: spacing[3],
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    backgroundColor: SEMANTIC.surface.default,
    minHeight: 48,
  },
  inputWithIcon: {
    paddingLeft: spacing[3] + 18 + spacing[2],
  },
  error: {
    fontSize: typography.fontSize.sm,
    color: ERROR_TEXT,
    marginTop: spacing[1],
    fontWeight: typography.fontWeight.medium,
  },
  errorIcon: {
    fontSize: typography.fontSize.sm,
  },
  helper: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
});
