import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SEMANTIC } from '@/constants/colors';
import { spacing, typography } from '@/theme/theme';

interface Props {
  icon: React.ReactNode;
  title: string;
  /** When true, draws a thin top divider above (matches web's `border-t pt-6`). */
  withDivider?: boolean;
}

/**
 * "Icon + bold title" subsection header used inside Step 5 (Cognitive Status,
 * Communication Needs, Mobility Status, Behavioral Warnings, Medical Devices).
 */
export function SectionHeader({ icon, title, withDivider }: Props) {
  return (
    <View style={withDivider && styles.withDivider}>
      <View style={styles.row}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  withDivider: {
    borderTopWidth: 1,
    borderTopColor: SEMANTIC.border.light,
    paddingTop: spacing[5],
    marginTop: spacing[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
  },
});
