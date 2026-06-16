import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';
import type { Option } from '../enums';

interface Props {
  label?: string;
  options: Option[];
  value: string[];
  onChange: (next: string[]) => void;
  /** Number of columns. Defaults to 2. */
  columns?: 1 | 2 | 3;
}

const CHECK_BLUE = '#2563eb';

/**
 * Two- or three-column plain checkbox group with text labels (matches the
 * web's behavioral-warnings / cognitive-behaviors / medical-devices grids).
 */
export function CheckboxGrid({ label, options, value, onChange, columns = 2 }: Props) {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  const basisPct = columns === 1 ? '100%' : columns === 2 ? '48%' : '31.5%';

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              style={[styles.item, { flexBasis: basisPct as any }]}
              onPress={() => toggle(opt.value)}
            >
              <View style={[styles.box, selected && styles.boxOn]}>
                {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={styles.itemLabel}>{opt.label}</Text>
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
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: spacing[3],
    rowGap: spacing[2],
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexGrow: 1,
    minWidth: 140,
    paddingVertical: 4,
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: GRAY[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: {
    borderColor: CHECK_BLUE,
    backgroundColor: CHECK_BLUE,
  },
  itemLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
  },
});

void borderRadius;
