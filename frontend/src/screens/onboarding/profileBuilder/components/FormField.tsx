import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

type PassThrough = Omit<
  TextInputProps,
  'value' | 'onChange' | 'onChangeText' | 'style' | 'placeholderTextColor'
>;

interface Props extends PassThrough {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  helperText?: string;
}

/**
 * Lighter / more compact alternative to the global Input — designed for dense
 * forms with many fields per screen. Uses StyleSheet styles only (no theme
 * context overhead) for fast re-renders as the user types.
 */
export function FormField({
  label,
  required,
  value,
  onChange,
  helperText,
  multiline,
  numberOfLines,
  ...rest
}: Props) {
  const lines = numberOfLines ?? 1;
  return (
    <View>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          multiline && { minHeight: 24 * lines + 20, textAlignVertical: 'top' },
        ]}
        value={value}
        onChangeText={onChange}
        multiline={multiline}
        numberOfLines={multiline ? lines : undefined}
        placeholderTextColor={GRAY[400]}
        {...rest}
      />
      {helperText && <Text style={styles.helper}>{helperText}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  required: {
    color: PRIMARY[600],
  },
  input: {
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    backgroundColor: SEMANTIC.surface.default,
  },
  helper: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginTop: spacing[1],
  },
});
