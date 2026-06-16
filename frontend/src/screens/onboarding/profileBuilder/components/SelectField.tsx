import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  label: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Truthy → red border. Pass a string to also render the message below. */
  error?: string | boolean;
}

/**
 * Tap-to-open dropdown picker. Renders a fake select that opens a full-screen
 * modal with the option list — gives us full styling control across iOS/Android
 * (the native Picker looks very different on each platform).
 */
export function SelectField({
  label,
  required,
  optional,
  placeholder = 'Select',
  value,
  options,
  onChange,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const hasError = Boolean(error);

  return (
    <View>
      {label ? (
        <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
          {label}
          {required && <Text style={styles.required}> *</Text>}
          {optional && <Text style={styles.optional}> (Optional)</Text>}
        </Text>
      ) : null}
      <Pressable
        style={[styles.button, hasError && styles.buttonError]}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[styles.value, !selected && styles.placeholder]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={GRAY[500]} />
      </Pressable>
      {typeof error === 'string' && error.length > 0 ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <SafeAreaView style={styles.sheetSafe} edges={['bottom']}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{label}</Text>
                <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                  <Ionicons name="close" size={22} color={SEMANTIC.text.primary} />
                </Pressable>
              </View>
              <FlatList
                data={options}
                keyExtractor={(o) => o.value}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.sheetListContent}
                renderItem={({ item }) => {
                  const isSelected = item.value === value;
                  return (
                    <Pressable
                      style={styles.option}
                      onPress={() => {
                        onChange(item.value);
                        setOpen(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color={PRIMARY[600]} />
                      )}
                    </Pressable>
                  );
                }}
              />
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
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
  required: { color: PRIMARY[600] },
  optional: {
    color: SEMANTIC.text.secondary,
    fontWeight: typography.fontWeight.normal,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    backgroundColor: SEMANTIC.surface.default,
    minHeight: 48,
  },
  buttonError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: '#dc2626',
    marginTop: spacing[1],
    fontWeight: typography.fontWeight.medium,
  },
  value: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  placeholder: {
    color: GRAY[400],
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: SEMANTIC.surface.default,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
  },
  sheetSafe: {
    paddingBottom: spacing[2],
  },
  sheetListContent: {
    // Extra bottom padding so the final option always clears the Android
    // navigation bar / gesture pill in edge-to-edge mode. The SafeAreaView
    // above adds the system inset on top of this.
    paddingBottom: spacing[6],
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  sheetTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },
  optionLabelSelected: {
    color: PRIMARY[700],
    fontWeight: typography.fontWeight.semibold,
  },
});
