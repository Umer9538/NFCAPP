/**
 * Empty State Component
 * Displays when lists or data are empty
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SEMANTIC, PRIMARY } from '@/constants/colors';
import { spacing } from '@/theme/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionTitle?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  icon = 'folder-open-outline',
  title,
  description,
  actionTitle,
  onActionPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={80} color={SEMANTIC.text.tertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionTitle && onActionPress && (
        <Pressable style={styles.actionButton} onPress={onActionPress}>
          <Text style={styles.actionButtonText}>{actionTitle}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  iconContainer: {
    marginBottom: spacing[4],
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: SEMANTIC.text.primary,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: SEMANTIC.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    paddingHorizontal: spacing[4],
  },
  actionButton: {
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    backgroundColor: PRIMARY[600],
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
