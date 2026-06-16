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
}

const CHECK_BLUE = '#2563eb';

/**
 * Multi-select rendered as pill-shaped checkboxes (matches the web's allergy
 * reaction-types row: square checkbox inside a rounded-full white pill).
 */
export function CheckboxPill({ label, options, value, onChange }: Props) {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = value.includes(opt.value);
          return (
            <Pressable
              key={opt.value}
              style={styles.pill}
              onPress={() => toggle(opt.value)}
            >
              <View
                style={[
                  styles.box,
                  selected && styles.boxOn,
                ]}
              >
                {selected && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={styles.pillText}>{opt.label}</Text>
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
    gap: spacing[2],
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: '#ffffff',
  },
  box: {
    width: 16,
    height: 16,
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
  pillText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
  },
});
