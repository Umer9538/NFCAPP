import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { SEMANTIC, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
  private?: boolean;
}

export function SectionCard({ title, subtitle, children, style, private: isPrivate }: Props) {
  return (
    <View style={[styles.card, style]}>
      {(title || isPrivate) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {isPrivate && <Text style={styles.privateBadge}>PRIVATE</Text>}
        </View>
      )}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: SEMANTIC.surface.default,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: SEMANTIC.border.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[1],
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
    flex: 1,
  },
  privateBadge: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: GRAY[600],
    backgroundColor: GRAY[100],
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    letterSpacing: typography.letterSpacing.wide,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    marginBottom: spacing[3],
  },
  body: {
    gap: spacing[3],
  },
});
