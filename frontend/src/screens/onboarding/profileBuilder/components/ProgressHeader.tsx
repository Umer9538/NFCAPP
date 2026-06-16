import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY, GRAY } from '@/constants/colors';
import { spacing, typography, borderRadius } from '@/theme/theme';

interface Props {
  currentIndex: number; // 0-based
  totalSteps: number;
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconNode?: React.ReactNode;
  /** When true, renders a "Saving…" indicator next to the percentage. */
  saving?: boolean;
}

export function ProgressHeader({
  currentIndex,
  totalSteps,
  title,
  description,
  icon,
  iconNode,
  saving,
}: Props) {
  const pct = Math.min(1, Math.max(0, (currentIndex + 1) / totalSteps));
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text
          style={styles.stepLabel}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Step {currentIndex + 1} of {totalSteps}
        </Text>
        <View style={styles.rightCluster}>
          {saving && (
            <View style={styles.savingRow}>
              <ActivityIndicator size="small" color={GRAY[500]} />
              <Text style={styles.savingText} numberOfLines={1}>
                Saving…
              </Text>
            </View>
          )}
          <Text
            style={styles.pctLabel}
            numberOfLines={1}
            ellipsizeMode="clip"
          >
            {Math.round(pct * 100)}%
          </Text>
        </View>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct * 100}%` }]} />
      </View>
      <View style={styles.titleRow}>
        {iconNode ? (
          <View style={styles.iconBadge}>{iconNode}</View>
        ) : icon ? (
          <View style={styles.iconBadge}>
            <Ionicons name={icon} size={22} color={PRIMARY[600]} />
          </View>
        ) : null}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    paddingBottom: spacing[4],
    backgroundColor: SEMANTIC.surface.default,
    borderBottomWidth: 1,
    borderBottomColor: SEMANTIC.border.light,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  stepLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: SEMANTIC.text.primary,
    flex: 1,
    minWidth: 0,
    marginRight: spacing[2],
  },
  rightCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flexShrink: 0,
  },
  savingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savingText: {
    fontSize: typography.fontSize.xs,
    color: GRAY[500],
    fontWeight: typography.fontWeight.medium,
  },
  pctLabel: {
    fontSize: typography.fontSize.sm,
    color: PRIMARY[600],
    fontWeight: typography.fontWeight.semibold,
  },
  barTrack: {
    height: 6,
    backgroundColor: GRAY[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing[4],
  },
  barFill: {
    height: '100%',
    backgroundColor: PRIMARY[600],
    borderRadius: borderRadius.full,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: PRIMARY[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: SEMANTIC.text.primary,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: SEMANTIC.text.secondary,
    marginTop: 2,
  },
});
