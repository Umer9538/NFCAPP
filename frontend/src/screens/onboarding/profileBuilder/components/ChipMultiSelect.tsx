import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';
import type { Option } from '../enums';

interface Props {
  label?: string;
  options: Option[] | readonly string[];
  /** For single-select, length 0 or 1 */
  value: string[];
  onChange: (next: string[]) => void;
  single?: boolean;
  required?: boolean;
}

function normalize(opts: Option[] | readonly string[]): Option[] {
  return opts.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
}

export function ChipMultiSelect({ label, options, value, onChange, single, required }: Props) {
  const opts = normalize(options);

  const toggle = (val: string) => {
    if (single) {
      onChange(value[0] === val ? [] : [val]);
      return;
    }
    if (value.includes(val)) onChange(value.filter((v) => v !== val));
    else onChange([...value, val]);
  };

  return (
    <View>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      <View style={styles.chipRow}>
        {opts.map((o) => {
          const selected = value.includes(o.value);
          return (
            <Pressable
              key={o.value}
              onPress={() => toggle(o.value)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  required: {
    color: PRIMARY[600],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.surface.default,
  },
  chipSelected: {
    backgroundColor: PRIMARY[50],
    borderColor: PRIMARY[600],
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    color: GRAY[700],
  },
  chipTextSelected: {
    color: PRIMARY[700],
    fontWeight: typography.fontWeight.semibold,
  },
});
