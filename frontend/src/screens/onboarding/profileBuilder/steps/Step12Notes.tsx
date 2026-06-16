import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

import { CheckCircleIcon } from '../components/LucideIcons';
import type { StepProps } from '../types';

export function Step12Notes({ data, update }: StepProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.intro}>
        Use this space to add any other critical information that first responders should know.
      </Text>

      <View>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={styles.input}
          value={data.additionalNotes}
          onChangeText={(v) => update('additionalNotes', v)}
          placeholder="Any other critical information that emergency responders should know..."
          placeholderTextColor={GRAY[400]}
          multiline
          textAlignVertical="top"
        />
      </View>

      <View style={styles.almostDoneBanner}>
        <CheckCircleIcon size={20} color="#16a34a" />
        <View style={styles.bannerBody}>
          <Text style={styles.almostDoneTitle}>Almost Done!</Text>
          <Text style={styles.almostDoneBody}>
            Review your information and click "Complete Setup" to finish your profile.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
    gap: spacing[4],
  },
  intro: {
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.secondary,
    lineHeight: typography.lineHeight.normal * typography.fontSize.base,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: SEMANTIC.text.primary,
    marginBottom: spacing[1],
  },
  input: {
    borderWidth: 1,
    borderColor: SEMANTIC.border.default,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    fontSize: typography.fontSize.base,
    color: SEMANTIC.text.primary,
    backgroundColor: SEMANTIC.surface.default,
    minHeight: 200,
  },
  almostDoneBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  bannerBody: {
    flex: 1,
    gap: 4,
  },
  almostDoneTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: '#14532d',
  },
  almostDoneBody: {
    fontSize: typography.fontSize.sm,
    color: '#166534',
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
});
