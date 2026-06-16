import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';
import type { Option } from '../enums';

const RADIO_BLUE = '#2563eb';

interface Props {
  label?: string;
  options: Option[];
  value: string;
  onChange: (next: string) => void;
}

/**
 * Classic radio button group — circle outline that fills when selected. Used
 * for short single-select fields like DNR / Organ Donor on Step 1 where the
 * web design uses radios (not chips).
 */
export function RadioGroup({ label, options, value, onChange }: Props) {
  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={styles.option}
              onPress={() => onChange(opt.value)}
              hitSlop={6}
            >
              <View style={[styles.outerCircle, selected && styles.outerCircleSelected]}>
                {selected && <View style={styles.innerCircle} />}
              </View>
              <Text style={styles.optionLabel}>{opt.label}</Text>
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
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[4],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GRAY[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircleSelected: {
    borderColor: RADIO_BLUE,
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: RADIO_BLUE,
  },
  optionLabel: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
  },
});
