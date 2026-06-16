import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

interface Props {
  /** Stored as "YYYY-MM" — matches the web app's diagnosis-date format. */
  value: string;
  onChange: (next: string) => void;
  label?: string;
  /** When true, both selects are disabled and the value is wiped. */
  unknown: boolean;
  onUnknownChange: (next: boolean) => void;
  unknownLabel?: string;
}

const MONTHS = [
  ['01', 'January'],
  ['02', 'February'],
  ['03', 'March'],
  ['04', 'April'],
  ['05', 'May'],
  ['06', 'June'],
  ['07', 'July'],
  ['08', 'August'],
  ['09', 'September'],
  ['10', 'October'],
  ['11', 'November'],
  ['12', 'December'],
];

function yearList(): string[] {
  const now = new Date().getFullYear();
  const out: string[] = [];
  for (let y = now; y >= now - 100; y--) out.push(String(y));
  return out;
}

/**
 * Two-up Month + Year picker with an "I don't remember" toggle — mirrors
 * how the web's conditions step captures `diagnosisDate`. Stored as YYYY-MM.
 */
export function MonthYearPicker({
  value,
  onChange,
  label = 'Date Diagnosed',
  unknown,
  onUnknownChange,
  unknownLabel = "Don't remember date diagnosed",
}: Props) {
  const [year, month] = value ? value.split('-') : ['', ''];

  const setMonth = (m: string) => {
    if (unknown) return;
    onChange(year ? `${year}-${m}` : `${new Date().getFullYear()}-${m}`);
  };
  const setYear = (y: string) => {
    if (unknown) return;
    onChange(month ? `${y}-${month}` : `${y}-01`);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        style={styles.unknownRow}
        onPress={() => {
          const next = !unknown;
          onUnknownChange(next);
          if (next) onChange('');
        }}
      >
        <View style={[styles.checkbox, unknown && styles.checkboxOn]}>
          {unknown && <Ionicons name="checkmark" size={14} color="#fff" />}
        </View>
        <Text style={styles.unknownText}>{unknownLabel}</Text>
      </Pressable>

      <View style={[styles.row, unknown && { opacity: 0.4 }]}>
        <View style={styles.col}>
          <Text style={styles.subLabel}>Month</Text>
          <View style={styles.chipWrap}>
            {MONTHS.map(([code, name]) => (
              <Pressable
                key={code}
                disabled={unknown}
                onPress={() => setMonth(code)}
                style={[styles.chip, month === code && styles.chipOn]}
              >
                <Text style={[styles.chipText, month === code && styles.chipTextOn]}>
                  {name.slice(0, 3)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.col}>
          <Text style={styles.subLabel}>Year</Text>
          <View style={styles.chipWrap}>
            {yearList().slice(0, 12).map((y) => (
              <Pressable
                key={y}
                disabled={unknown}
                onPress={() => setYear(y)}
                style={[styles.chip, year === y && styles.chipOn]}
              >
                <Text style={[styles.chipText, year === y && styles.chipTextOn]}>{y}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
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
  subLabel: {
    fontSize: typography.fontSize.xs,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[1],
  },
  unknownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: GRAY[400],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SEMANTIC.surface.default,
  },
  checkboxOn: {
    backgroundColor: PRIMARY[600],
    borderColor: PRIMARY[600],
  },
  unknownText: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.primary,
  },
  row: {
    gap: spacing[3],
  },
  col: {
    gap: spacing[1],
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    backgroundColor: SEMANTIC.surface.default,
  },
  chipOn: {
    borderColor: PRIMARY[600],
    backgroundColor: PRIMARY[50],
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    color: GRAY[700],
  },
  chipTextOn: {
    color: PRIMARY[700],
    fontWeight: typography.fontWeight.semibold,
  },
});
